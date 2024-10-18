import { useState } from "react";
import { currentSpots, getSpots } from "../../store/spots";
import { useAppDispatch, useAppSelector, useUser } from "../../store/store";
import SpotTile from "./SpotTile";
import { Link } from "react-router-dom";

function MySpots() {
	const [hydrated, setHydrated] = useState(false);
	const dispatch = useAppDispatch();
	const user = useUser();
	const mySpots = useAppSelector((store) => currentSpots(store, user?.id));

	if (!user) {
		return <h1>You have no Spots! (you are not logged in!)</h1>;
	}

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
		<div className="MySpots">
			<h1>Manage Spots</h1>
			{mySpots.length === 0 && (
				<h2>
					<Link to="/spots/new">Create a New Spot</Link>
				</h2>
			)}
			<ul className="spots-list">
				{mySpots.map((s) => (
					<SpotTile key={s.id} spotId={s.id} crud={true} />
				))}
			</ul>
		</div>
	);
}

export default MySpots;
