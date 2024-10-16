import { Link } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";
import { useAppSelector } from "../../store/store";

/**
 * @param {Object} param0
 * @param {boolean} param0.isLoaded
 */
function Navigation({ isLoaded }) {
	const sessionUser = useAppSelector((state) => state.session.user);

	return (
		<>
			<ul className="nav-main">
				<li>
					<Link to="/" className="img">
						<img src="/icon.webp" />
						HotSpot
					</Link>
				</li>
				<li>
					{isLoaded && (
						<div className="login">
							<ProfileButton user={sessionUser} />
						</div>
					)}
				</li>
			</ul>
		</>
	);
}

export default Navigation;
