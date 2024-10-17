import { csrfFetch } from "./csrf";
import { upgradeTimeStamps } from "./util";

/**
 * @param {{url: string, id: number}[]} images
 * @param {number} reviewId
 * @returns {HotSpot.Store.ReviewImage[]}
 */
function transformImages(images, reviewId) {
	/** @type {HotSpot.Store.ReviewImage[]} */
	let out = [];

	for (const i of images) {
		try {
			out.push({ id: i.id, url: new URL(i.url), reviewId });
		} catch (e) {
			if (!(e instanceof TypeError)) {
				throw e;
			}
		}
	}

	return out;
}

/**
 * @param {HotSpot.API.SpotReview}  review
 * @returns {HotSpot.Store.Review}
 */
function transformSpotReview(review) {
	const { User, ReviewImages, ...rest } = review;

	return upgradeTimeStamps({
		...rest,
		user: User,
		images: transformImages(ReviewImages, review.id),
	});
}

const SPOT_REVIEWS = "reviews/FOR_SPOT";

/**
 * @param {HotSpot.API.SpotReviews} apiResults
 */
const insertSpotReviews = (apiResults) => {
	return {
		type: SPOT_REVIEWS,
		payload: apiResults,
	};
};

/**
 * @param {number} spotId
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const getReviews = (spotId) => async (dispatch) => {
	const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
	const data = /** @type {HotSpot.API.SpotReviews} */ (await response.json());
	dispatch(insertSpotReviews(data));
	return response;
};

/** @type {HotSpot.Store.ReviewState} */
const initialState = { all: {}, map: {} };

/**
 * @template {import("./store").AnyAction} A
 * @type {import("react").Reducer<HotSpot.Store.ReviewState, A>}
 */
const reviewsReducer = (state = initialState, action) => {
	switch (action.type) {
		case SPOT_REVIEWS: {
			const newState = { map: { ...state.map }, all: { ...state.all } };

			/** @type {HotSpot.API.SpotReviews} */
			const payload = action.payload;

			for (const itm of payload.Reviews) {
				const review = transformSpotReview(itm);

				if (review.spotId in newState.map) {
					newState.map[review.spotId] = [
						...newState.map[review.spotId],
						review.id,
					];
				} else {
					newState.map[review.spotId] = [review.id];
				}

				newState.all[review.id] = review;
			}

			return newState;
		}

		default:
			return state;
	}
};

export default reviewsReducer;
