import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";
import { useAppSelector } from "../../store/store";

function Navigation({ isLoaded }) {
	const sessionUser = useAppSelector((state) => state.session.user);

	return (
		<>
			<ul>
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
