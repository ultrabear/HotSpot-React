import { AnyAction } from "redux";
import { csrfFetch } from "./csrf";
import { upgradeTimeStamps } from "./util";

function transformImages(
	images: { url: string; id: number }[],
	reviewId: number,
): HotSpot.Store.ReviewImage[] {
	let out: HotSpot.Store.ReviewImage[] = [];

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
function transformSpotReview(
	review: HotSpot.API.SpotReview,
): HotSpot.Store.Review {
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
function insertSpotReviews(apiResults: HotSpot.API.SpotReviews) {
	return {
		type: SPOT_REVIEWS,
		payload: apiResults,
	};
}

/**
 * @param {number} spotId
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const getReviews =
	(spotId: number): import("./store").ThunkDispatchFn<Response> =>
	async (dispatch) => {
		const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
		const data = /** @type {HotSpot.API.SpotReviews} */ (await response.json());
		dispatch(insertSpotReviews(data));
		return response;
	};

const DELETE_REVIEW = "reviews/DELETE_SINGLE";

/**
 * @param {number} reviewId
 */
const deleteReviewActor = (reviewId: number) => {
	return { type: DELETE_REVIEW, payload: reviewId };
};

/**
 * @param {number} reviewId
 * @returns {import("./store").ThunkDispatchFn<Object>}
 */
export const deleteReview =
	(reviewId: number): import("./store").ThunkDispatchFn<object> =>
	async (dispatch) => {
		const response = await csrfFetch(`/api/reviews/${reviewId}`, {
			method: "DELETE",
		});
		const res = await response.json();
		dispatch(deleteReviewActor(reviewId));
		return res;
	};

/** @type {HotSpot.Store.ReviewState} */
const initialState: HotSpot.Store.ReviewState = { all: {}, map: {} };

const reviewsReducer: import("react").Reducer<
	HotSpot.Store.ReviewState,
	AnyAction
> = (state = initialState, action) => {
	switch (action.type) {
		case DELETE_REVIEW: {
			/** @type {number} */
			const reviewId: number = action.payload;

			const newState = { map: { ...state.map }, all: { ...state.all } };

			const spot = newState.all[reviewId].spotId;

			delete newState.all[reviewId];

			newState.map[spot] = new Set([...newState.map[spot]]);
			newState.map[spot].delete(reviewId);

			return newState;
		}

		case SPOT_REVIEWS: {
			const newState = { map: { ...state.map }, all: { ...state.all } };

			/** @type {HotSpot.API.SpotReviews} */
			const payload: HotSpot.API.SpotReviews = action.payload;

			for (const itm of payload.Reviews) {
				const review = transformSpotReview(itm);

				if (review.spotId in newState.map) {
					newState.map[review.spotId] = new Set([
						...newState.map[review.spotId],
						review.id,
					]);
				} else {
					newState.map[review.spotId] = new Set([review.id]);
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
