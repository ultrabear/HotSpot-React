import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getSpots, spotsList } from "../../store/spots";
import "./SpotsList.css";
import SpotTile from "./SpotTile";

/**
 * @typedef {import("../../store/store").RootState} RootState
 */

function SpotsList() {
	const [hydrated, setHydrated] = useState(false);
	const dispatch = useAppDispatch();
	const spotsArr = useAppSelector((store) => spotsList(store));

	if (!hydrated) {
		setHydrated(true);
		(async () => {
			// eslint-disable-next-line no-constant-condition
			for (let page = 1; true; page++) {
				const res = await dispatch(getSpots(page, 20));
				if (res.Spots.length !== 20) {
					break;
				}
			}
		})();
	}

	return (
		<ul className="spots-list">
			{spotsArr.map((s) => (
				<SpotTile key={s.id} spotId={s.id} />
			))}
		</ul>
	);
}

export default SpotsList;
