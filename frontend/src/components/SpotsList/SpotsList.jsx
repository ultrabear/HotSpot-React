import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getSpots } from "../../store/spots";
import "./SpotsList.css";
import { Link } from "react-router-dom";

/**
 * @param {Object} prop
 * @param {HotSpot.Store.Spot} prop.spot
 */
function SpotTile({ spot }) {
	let imgUrl = "";

	if (spot.previewImage) {
		imgUrl = spot.previewImage.toString();
	}

	return (
		<Link to={`/spots/${spot.id}`} title={spot.name}>
			<li>
				<img src={imgUrl} width="300px" height="300px" />
				<div className="line-one">
					<span>
						{spot.city}, {spot.state}
					</span>
					<span>{spot.avgRating ? `Rating: ${spot.avgRating}/5` : "New"}</span>
				</div>
				<div>{`$${spot.price} night`}</div>
			</li>
		</Link>
	);
}

function SpotsList() {
	const [hydrated, setHydrated] = useState(false);
	const spots = useAppSelector((s) => s.spots);
	const dispatch = useAppDispatch();

	if (!hydrated) {
		dispatch(getSpots(1, 20));
		setHydrated(true);
	}

	/** @type {HotSpot.Store.Spot[]} */
	const spotsArr = [];

	for (const k in spots) {
		spotsArr.push(spots[k]);
	}

	return (
		<ul className="spots-list">
			{spotsArr.map((s) => (
				<SpotTile key={s.id} spot={s} />
			))}
		</ul>
	);
}

export default SpotsList;
