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
						<img data-testid="logo" src="/icon.webp" />
						HotSpot
					</Link>
				</li>
				<li>
					{isLoaded && (
						<>
							<div className="createSpot">
								{sessionUser !== null && (
									<Link to="/spots/new" data-testid="create-new-spot-button">
										<button>Create a Spot</button>
									</Link>
								)}
							</div>
							<div className="login" data-testid="user-menu-button">
								<ProfileButton user={sessionUser} />
							</div>
						</>
					)}
				</li>
			</ul>
		</>
	);
}

export default Navigation;
