import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector, useUser } from "../../store/store";
import { useEffect, useState } from "react";
import { getSpot } from "../../store/spots";
import "./SpotDetails.css";
import { formatRating } from "../../util";
import { getReviews } from "../../store/review";

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
 */
function Review({ reviewId }) {
	const review = useAppSelector((s) => s.reviews.all[reviewId]);

	return (
		<>
			<h3>{review.user.firstName}</h3>
			<h3 className="date">
				{review.updatedAt.toLocaleString("default", {
					month: "long",
					year: "numeric",
				})}
			</h3>
			<p>{review.review}</p>
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

	const reviewIds = useAppSelector((s) => s.reviews.map[id] ?? []);

	const user = useUser();

	useEffect(() => {
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
	}, [checked, id, dispatch]);

	useEffect(() => {
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
	}, [checkReview, id, dispatch]);

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

	const reviewIdArr = [...reviewIds];
	reviewIdArr.sort((a, b) => b - a);

	const emptyReviewPrompt =
		reviewIdArr.length === 0 && user !== null && user.id !== spot.ownerId;

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
				{reviewIdArr.map((i) => (
					<Review key={i} reviewId={i} />
				))}
			</div>
		</div>
	);
}

export default SpotDetails;
