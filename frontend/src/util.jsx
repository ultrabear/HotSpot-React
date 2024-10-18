import { FaRegStar } from "react-icons/fa";
/**
 * @param {HotSpot.Store.Spot} spot
 * @returns {JSX.Element}
 * */
export function formatRating(spot) {
	return spot.avgRating ? (
		<>
			<FaRegStar />
			<span data-testid="spot-rating">{` ${spot.avgRating.toFixed(1)}`}</span>
		</>
	) : (
		<>
			<FaRegStar /> New
		</>
	);
}
