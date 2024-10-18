import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { formatRating } from "../../util";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import { useModal } from "../../context/Modal";
import { csrfFetch } from "../../store/csrf";
import { useDispatch } from "react-redux";
import { deleteSpot } from "../../store/spots";

/**
 * @param {Object} param0
 * @param {number} param0.spotId
 */
function DeleteSpot({ spotId }) {
	const { closeModal } = useModal();
	const dispatch = useAppDispatch();

	const clickDeleteSpot = () => {
		dispatch(deleteSpot(spotId)).then(closeModal);
	};

	return (
		<>
			<h1>Confirm Delete</h1>
			<p>Are you sure you want to remove this spot from the listings?</p>
			<div>
				<button onClick={clickDeleteSpot}>Yes (Delete Spot)</button>
			</div>
			<div>
				<button onClick={closeModal}>No (Keep Spot)</button>
			</div>
		</>
	);
}

/**
 * @param {Object} prop
 * @param {number} prop.spotId
 * @param {boolean} [prop.crud]
 */
function SpotTile({ spotId, crud }) {
	const addModOpts = crud === true;

	const spot = useAppSelector((state) => state.spots[spotId]);

	let imgUrl = "";

	if (spot.previewImage) {
		imgUrl = spot.previewImage.toString();
	}

	return (
		<li>
			<Link to={`/spots/${spot.id}`} title={spot.name}>
				<img src={imgUrl} width="300px" height="300px" />
				<div className="line-one">
					<span>
						{spot.city}, {spot.state}
					</span>
					<span>{formatRating(spot)}</span>
				</div>
				<div>{`$${spot.price} night`}</div>
			</Link>

			{addModOpts && (
				<div>
					<Link to={`/spots/${spotId}/edit`}>
						<button>Update</button>
					</Link>
					<OpenModalButton
						buttonText="Delete"
						modalComponent={<DeleteSpot spotId={spot.id} />}
					/>
				</div>
			)}
		</li>
	);
}

export default SpotTile;
