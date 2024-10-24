import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { formatRating } from "../../util";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import { deleteSpot } from "../../store/spots";
import DeleteModal from "../DeleteModal/DeleteModal";

function SpotTile({ spotId, crud }: { spotId: number; crud?: boolean; }) {
	const addModOpts = crud === true;
	const dispatch = useAppDispatch();

	const spot = useAppSelector((state) => state.spots[spotId]);

	let imgUrl = "";

	if (spot.previewImage) {
		imgUrl = spot.previewImage.toString();
	}

	return (
		<li data-testid="spot-tile">
			<Link to={`/spots/${spot.id}`} title={spot.name} data-testid="spot-link">
				<div data-testid="spot-name">
					<div data-testid="spot-tooltip" title={spot.name}>
						<img
							src={imgUrl}
							width="300px"
							height="300px"
							data-testid="spot-thumbnail-image"
						/>
						<div className="line-one">
							<span data-testid="spot-city">
								{spot.city}, {spot.state}
							</span>
							<span>{formatRating(spot)}</span>
						</div>
						<div data-testid="spot-price">{`$${spot.price} night`}</div>
					</div>
				</div>
			</Link>

			{addModOpts && (
				<div>
					<Link to={`/spots/${spotId}/edit`}>
						<button>Update</button>
					</Link>
					<span>
						<OpenModalButton
							buttonText="Delete"
							modalComponent={
								<DeleteModal
									deleteCallback={() => dispatch(deleteSpot(spotId))}
									confirmText="remove this spot?"
									buttonType="Spot"
									internal="spot"
								/>
							}
						/>
					</span>
				</div>
			)}
		</li>
	);
}

export default SpotTile;
