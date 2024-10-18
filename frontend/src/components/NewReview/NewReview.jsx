import { useState } from "react";
import { useModal } from "../../context/Modal";
import { jsonPost } from "../../store/csrf";

import { IoIosStar, IoIosStarOutline } from "react-icons/io";

/**
 * @param {Object} param0
 * @param {number} param0.spotId
 * @param {() => void} param0.onClose
 */
function NewReview({ spotId, onClose }) {
	const [review, setReview] = useState("");
	const [errs, setErrs] = useState({});

	const { closeModal } = useModal();
	const [stars, setStars] = useState(0);

	/** @param {React.FormEvent<HTMLFormElement>} e */
	const onSubmit = async (e) => {
		e.preventDefault();

		try {
			await jsonPost(`/api/spots/${spotId}/reviews`, {
				review,
				stars: String(stars),
			});

			onClose();
			closeModal();
		} catch (e) {
			setErrs((await /**@type{Response}*/ (e).json()).errors);
		}
	};

	return (
		<div className="Global Modal">
			<form className="NewReview" onSubmit={onSubmit}>
				<h2>How was your stay?</h2>
				<span className="Global errors">
					{Object.values(errs).map((e) => (
						<div key={e}>{e}</div>
					))}
				</span>
				<textarea
					placeholder="Leave your review here..."
					value={review}
					onChange={(e) => setReview(e.target.value)}
				/>
				<div style={{ display: "flex", justifyContent: "center" }}>
					{[...Array(5)].map((_, i) => {
						return (
							<button
								data-testid="review-star-clickable"
								type="button"
								key={i}
								onClick={() => setStars(i + 1)}
							>
								{i < stars ? <IoIosStar /> : <IoIosStarOutline />}
							</button>
						);
					})}
					Stars
				</div>
				<button
					type="submit"
					disabled={review.length < 10 || stars > 5 || stars < 1}
				>
					Submit Your Review
				</button>
			</form>
		</div>
	);
}

export default NewReview;
