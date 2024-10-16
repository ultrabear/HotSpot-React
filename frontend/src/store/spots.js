import { csrfFetch } from "./csrf";
import { upgradeTimeStamps } from "./util";

/**
 * @param {HotSpot.API.BulkSpot} spot
 * @returns {HotSpot.Store.Spot}
 */
function toNormalized(spot) {
	const { previewImage, ...rest } = spot;

	/** @type {HotSpot.Store.Spot} */
	const data = upgradeTimeStamps({
		...rest,
		partial: true,
		images: {},
	});

	try {
		data.previewImage = new URL(previewImage);
	} catch (_) {
		// do nothing
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
		const response = await csrfFetch(`/api/spots?page=${page}&size=${size}`, {
			method: "GET",
		});
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
					newState[spot.id] = {
						...toNormalized(spot),
						images: newState[spot.id].images,
					};
				} else {
					newState[spot.id] = toNormalized(spot);
				}
			}

			return newState;
		}
	}

	return state;
};

export default spotsReducer;
