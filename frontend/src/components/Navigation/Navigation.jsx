import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation({ isLoaded }) {
	const sessionUser = useSelector((state) => state.session.user);

	return (
		<>
			<ul>
				<li>
					<Link to="/" className="img">
						<img src="/icon.webp" />
						HotSpot
					</Link>
				</li>
				<li className="login">
					<li>
						<NavLink to="/">Home</NavLink>
					</li>
					{isLoaded && (
						<li>
							<ProfileButton user={sessionUser} />
						</li>
					)}
				</li>
			</ul>
		</>
	);
}

export default Navigation;
