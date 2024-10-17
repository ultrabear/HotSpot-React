import { FaRegStar } from "react-icons/fa";
/**
 * @param {HotSpot.Store.Spot} spot
 * @returns {JSX.Element}
 * */
export function formatRating(spot) {
	return spot.avgRating ? (
		<>
			 <FaRegStar />{spot.avgRating}
		</>
	) : (
		<><FaRegStar /> New</>
	);
}
