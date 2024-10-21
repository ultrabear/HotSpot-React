import { FaRegStar } from "react-icons/fa";

export function formatRating(spot: HotSpot.Store.Spot): JSX.Element {
	return spot.avgRating ? (
		<>
			<FaRegStar />
			<span data-testid="spot-rating">{` ${spot.avgRating.toFixed(1)}`}</span>
		</>
	) : (
		<span data-testid="spot-rating">
			<FaRegStar /> New
		</span>
	);
}
