import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { formatRating } from "../../util";
import OpenModalButton from "../OpenModalButton/OpenModalButton";

function DeleteSpot() {
	return <>Are you Sure about this??</>;
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
						modalComponent={<DeleteSpot />}
					/>
				</div>
			)}
		</li>
	);
}

export default SpotTile;
