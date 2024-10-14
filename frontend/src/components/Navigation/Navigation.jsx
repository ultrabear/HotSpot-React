import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfileButton from "./ProfileButton";
import * as sessionActions from "../../store/session";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import "./Navigation.css";
import SignupFormModal from "../SignupFormModal/SignupFormModal";

function Navigation({ isLoaded }) {
	const sessionUser = useSelector((state) => state.session.user);
	const dispatch = useDispatch();

	const logout = (e) => {
		e.preventDefault();
		dispatch(sessionActions.logout());
	};

	return (
		<ul>
			<li>
				<NavLink to="/">Home</NavLink>
			</li>
			{isLoaded && (<li><ProfileButton user={sessionUser}/></li>)}
		</ul>
	);
}

export default Navigation;
