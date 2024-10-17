import { csrfFetch } from "./csrf";
import { upgradeTimeStamps } from "./util";

/**
 * @param {HotSpot.API.BulkSpot} spot
 * @returns {HotSpot.Store.Spot}
 */
function toNormalized(spot) {
	const { previewImage, avgRating, ...rest } = spot;

	/** @type {HotSpot.Store.Spot} */
	const data = upgradeTimeStamps({
		...rest,
		partial: true,
		images: {},
	});

	// single ne to catch undef
	if (avgRating != null) {
		data.avgRating = avgRating;
	}

	try {
		data.previewImage = new URL(previewImage);
	} catch (e) {
		if (e instanceof TypeError) {
			// pass
		} else {
			throw e;
		}
	}

	return data;
}

/**
 * @param {HotSpot.API.SingleSpot} spot
 * @returns {HotSpot.Store.Spot}
 */
function normalizeSingle(spot) {
	const { Owner, avgStarRating, SpotImages, ...rest } = spot;

	/** @type {HotSpot.Store.Spot} */
	const data = upgradeTimeStamps({
		...rest,
		partial: false,
		owner: Owner,
		images: {},
	});

	// single ne to catch undef
	if (avgStarRating != null) {
		data.avgRating = avgStarRating;
	}

	for (const img of SpotImages) {
		try {
			const normalized = {
				id: img.id,
				url: new URL(img.url),
				preview: img.preview,
				spotId: data.id,
			};

			if (normalized.preview) {
				data.previewImage = normalized.url;
			}

			data.images[normalized.id] = normalized;
		} catch (e) {
			if (e instanceof TypeError) {
				// pass
			} else {
				throw e;
			}
		}
	}

	return data;
}

/**
 * @typedef { { payload: HotSpot.API.BulkSpot[] } & import("./store").AnyAction   } SpotsFromAPI
 */

const HYDRATE_MANY_SPOTS = "spots/HYDRATE_MANY";

/**
 * @param {HotSpot.API.AllSpots} apiResults
 * @returns {SpotsFromAPI}
 */
const setSpotsFromAPI = (apiResults) => {
	return {
		type: HYDRATE_MANY_SPOTS,
		payload: apiResults.Spots,
	};
};

/**
 * @param {number} page
 * @param {number} size
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const getSpots =
	(page = 1, size = 10) =>
	async (dispatch) => {
		const response = await csrfFetch(`/api/spots?page=${page}&size=${size}`);
		const data = /** @type {HotSpot.API.AllSpots} */ (await response.json());
		dispatch(setSpotsFromAPI(data));
		return response;
	};

const HYDRATE_SINGLE_SPOT = "spots/HYDRATE_SINGLE";

/**
 * @param {HotSpot.API.SingleSpot} apiResults
 */
const singleSpotInsert = (apiResults) => {
	return {
		type: HYDRATE_SINGLE_SPOT,
		payload: apiResults,
	};
};

/**
 * @param {number} id
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const getSpot = (id) => async (dispatch) => {
	const response = await csrfFetch(`/api/spots/${id}`);
	const data = /** @type {HotSpot.API.SingleSpot} */ (await response.json());
	dispatch(singleSpotInsert(data));
	return response;
};

/** @type {HotSpot.Store.SpotState} */
const initialState = {};

/**
 * @template {import("./store").AnyAction} A
 * @type {import("react").Reducer<HotSpot.Store.SpotState, A>}
 */
const spotsReducer = (state = initialState, action) => {
	switch (action.type) {
		case HYDRATE_MANY_SPOTS: {
			const typedAction = /** @type {SpotsFromAPI} */ (
				/** @type {any} */ (action)
			);
			const spots = typedAction.payload;

			const newState = { ...state };

			for (const spot of spots) {
				if (spot.id in newState) {
					const old = newState[spot.id];

					/**  @type {HotSpot.Store.Spot}*/
					const nSpot = {
						...old,
						...toNormalized(spot),
						images: old.images,
					};

					newState[spot.id] = nSpot;
				} else {
					newState[spot.id] = toNormalized(spot);
				}
			}

			return newState;
		}
		case HYDRATE_SINGLE_SPOT: {
			/** @type {HotSpot.API.SingleSpot} */
			const spot = action.payload;

			const newState = { ...state };

			newState[spot.id] = normalizeSingle(spot);

			return newState;
		}
		default:
			return state;
	}
};

export default spotsReducer;
