import { useState } from "react";
import { useModal } from "../../context/Modal";
import { jsonPost } from "../../store/csrf";

/**
 * @param {Object} param0
 * @param {number} param0.spotId
 * @param {() => void} param0.onClose
 */
function NewReview({ spotId, onClose }) {
	const [review, setReview] = useState("");
	const [stars, setStars] = useState("");

	const { closeModal } = useModal();

	/** @param {React.FormEvent<HTMLFormElement>} e */
	const onSubmit = (e) => {
		e.preventDefault();

		jsonPost(`/api/spots/${spotId}/reviews`, { review, stars }).then(() => {
			onClose(), closeModal();
		});
	};

	return (
		<>
			<form className="NewReview" onSubmit={onSubmit}>
				How was your stay?
				<textarea
					placeholder="Leave your review here..."
					value={review}
					onChange={(e) => setReview(e.target.value)}
				/>
				<input
					type="number"
					min="1"
					max="5"
					value={stars}
					onChange={(e) => setStars(e.target.value)}
				/>{" "}
				Stars
				<button
					type="submit"
					disabled={
						review.length < 10 ||
						isNaN(Number(stars)) ||
						Number(stars) > 5 ||
						Number(stars) < 1
					}
				>
					Submit Your Review
				</button>
			</form>
		</>
	);
}

export default NewReview;
