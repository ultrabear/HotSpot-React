import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector, useUser } from "../../store/store";
import { useState } from "react";
import { getSpot } from "../../store/spots";
import "./SpotDetails.css";
import { formatRating } from "../../util";
import { deleteReview, getReviews } from "../../store/review";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import NewReview from "../NewReview/NewReview";
import DeleteModal from "../DeleteModal/DeleteModal";

/**
 * @typedef {"no" | "yes" | "checking"} CheckStatus
 */

/**
 * @param {CheckStatus} checked
 * @returns {boolean}
 */
function checking(checked) {
	return checked === "no" || checked === "checking";
}

/**
 * @param {Object} param0
 * @param {number} param0.reviewId
 * @param {(_: CheckStatus) => void} param0.setCheckReview
 * */
function Review({ reviewId, setCheckReview }) {
	const review = useAppSelector((s) => s.reviews.all[reviewId]);
	const user = useUser();
	const dispatch = useAppDispatch();

	const deletable = user !== null && user.id === review.user.id;

	const deleteCb = async () => {
		const res = await dispatch(deleteReview(reviewId));

		setCheckReview("no");

		return res;
	};

	return (
		<>
			<h3>
				{review.user.firstName}
				{deletable && (
					<span style={{ color: "grey", fontSize: "smaller" }}> (you)</span>
				)}
			</h3>
			<h3 className="date" style={{ color: "grey" }}>
				{review.updatedAt.toLocaleString("default", {
					month: "long",
					year: "numeric",
				})}
			</h3>
			<p>{review.review}</p>
			{deletable && (
				<OpenModalButton
					buttonText="Delete"
					modalComponent={
						<DeleteModal
							deleteCallback={deleteCb}
							confirmText="delete this review?"
							buttonType="Review"
						/>
					}
				/>
			)}
		</>
	);
}

function SpotDetails() {
	const { spotId } = useParams();
	const dispatch = useAppDispatch();

	const id = Number(spotId);

	const [checked, setChecked] = useState(/** @type {CheckStatus}*/ ("no"));
	const [checkReview, setCheckReview] = useState(
		/** @type {CheckStatus}*/ ("no"),
	);

	const spot = useAppSelector((s) => (id in s.spots ? s.spots[id] : null));

	const reviews = useAppSelector((s) =>
		[...(s.reviews.map[id] ?? [])].map((id) => s.reviews.all[id]),
	);

	const user = useUser();

	if (checked === "no") {
		setChecked("checking");
		(async () => {
			try {
				await dispatch(getSpot(id));
			} finally {
				setChecked("yes");
			}
		})();
	}

	if (checkReview === "no") {
		setCheckReview("checking");
		(async () => {
			try {
				await dispatch(getReviews(id));
			} finally {
				setCheckReview("yes");
			}
		})();
	}

	if (isNaN(id)) {
		return <h1>No Such Spot with id &quot;{id}&quot; was found :(</h1>;
	}

	if (!spot) {
		if (!checking(checked)) {
			return <h1>No Such Spot with id &quot;{id}&quot; was found :(</h1>;
		} else {
			return <h1>Loading...</h1>;
		}
	}

	/** @type {HotSpot.Store.SpotImage[]} */
	const images = [];

	for (const k in spot.images) {
		images.push(spot.images[k]);
	}

	images.sort((a, b) => Number(b.preview) - Number(a.preview));

	const preview = images[0]?.url?.toString() ?? "";
	const rest = images.slice(1);

	const reviewFmt = (
		<>
			{formatRating(spot)} {spot.numReviews ? "·" : false}{" "}
			{spot.numReviews
				? `${spot.numReviews} Review${spot.numReviews === 1 ? "" : "s"}`
				: false}
		</>
	);

	reviews.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

	const canReview =
		user !== null &&
		reviews.every((r) => r.user.id !== user.id) &&
		user.id !== spot.ownerId;

	const emptyReviewPrompt = reviews.length === 0 && canReview;

	return (
		<div className="SpotDetails">
			<h1>{spot.name}</h1>
			<h2>
				{spot.city}, {spot.state}, {spot.country}
			</h2>

			<div className="images">
				<img src={preview} />
				<div className="non-preview">
					{rest.map((i) => (
						<img key={i.id} src={i.url.toString()} />
					))}
				</div>
			</div>

			<div className="details">
				<span>
					<h3>
						Hosted by {spot.owner?.firstName} {spot.owner?.lastName}
					</h3>
					<p>{spot.description}</p>
				</span>
				<div className="reservation">
					<div className="flex">
						<span>${spot.price} night</span>
						<span>{reviewFmt}</span>
					</div>
					<div className="reserve-button">
						<button onClick={() => alert("Feature coming soon!")}>
							Reserve
						</button>
					</div>
				</div>
			</div>

			<div className="Global h-divider" />

			<div className="reviews">
				<h2>{reviewFmt}</h2>
				{emptyReviewPrompt && <h2>Be the first to post a review!</h2>}
				{canReview && (
					<OpenModalButton
						buttonText="Post Your Review"
						modalComponent={
							<NewReview
								spotId={spot.id}
								onClose={() => {
									setCheckReview("no");
									setChecked("no");
								}}
							/>
						}
					/>
				)}
				{reviews.map((i) => (
					<Review key={i.id} reviewId={i.id} setCheckReview={setCheckReview} />
				))}
			</div>
		</div>
	);
}

export default SpotDetails;
