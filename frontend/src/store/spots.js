import { createSelector } from "reselect";
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
 * @returns {import("./store").ThunkDispatchFn<HotSpot.API.AllSpots>}
 */
export const getSpots =
	(page = 1, size = 10) =>
	async (dispatch) => {
		const response = await csrfFetch(`/api/spots?page=${page}&size=${size}`);
		const data = /** @type {HotSpot.API.AllSpots} */ (await response.json());
		dispatch(setSpotsFromAPI(data));
		return data;
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

const DELETE_SPOT = "spots/DELETE_SINGLE";

/**
 * @param {number} id
 */
const deleteSpotAction = (id) => {
	return { type: DELETE_SPOT, payload: id };
};

/**
 * @param {number} id
 * @returns {import("./store").ThunkDispatchFn<HotSpot.API.SingleSpot>}
 */
export const getSpot = (id) => async (dispatch) => {
	const response = await csrfFetch(`/api/spots/${id}`);
	const data = /** @type {HotSpot.API.SingleSpot} */ (await response.json());
	dispatch(singleSpotInsert(data));
	return data;
};

/**
 * @param {number} id
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const deleteSpot = (id) => async (dispatch) => {
	const res = await csrfFetch(`/api/spots/${id}`, { method: "DELETE" });
	dispatch(deleteSpotAction(id));
	return res;
};

/** @type {HotSpot.Store.SpotState} */
const initialState = {};

/**
 * @template {import("./store").AnyAction} A
 * @type {import("react").Reducer<HotSpot.Store.SpotState, A>}
 */
const spotsReducer = (state = initialState, action) => {
	switch (action.type) {
		case DELETE_SPOT: {
			const { [action.payload]: unused, ...newState } = state;

			unused;

			return newState;
		}
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

export const spotsList = createSelector(
	[/** @param {import("./store").RootState} store; */ (store) => store.spots],
	(spots) => {
		const spotsArr = Object.values(spots);
		spotsArr.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
		return spotsArr;
	},
);

export const currentSpots = createSelector(
	[
		/** @param {import("./store").RootState} store; @param {number | undefined} userId */ (
			store,
			userId,
		) => ({ s: store.spots, u: userId }),
	],
	({ s: spots, u: userId }) => {
		const spotsArr = Object.values(spots).filter((s) => s.ownerId === userId);

		spotsArr.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
		return spotsArr;
	},
);

export default spotsReducer;
