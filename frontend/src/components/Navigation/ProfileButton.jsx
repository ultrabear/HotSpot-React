import * as sessionActions from "../../store/session";
import { AiOutlineUser } from "react-icons/ai";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import { useAppDispatch } from "../../store/store";
import { Navigate } from "react-router-dom";

/**
 * @param {Object} param0
 * @param {import("../../store/session").User | null} param0.user
 * */
function ProfileButton({ user }) {
	const dispatch = useAppDispatch();
	const [showMenu, setShowMenu] = useState(false);
	const [goHome, setGoHome] = useState(false);

	/** @type {React.MutableRefObject<HTMLUListElement | null>} */
	const ulRef = useRef(null);

	const logout = (e) => {
		e.preventDefault();
		setGoHome(true);
		dispatch(sessionActions.logout());
	};

	const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

	const toggleMenu = (e) => {
		e.stopPropagation(); // Keep click from bubbling up to document and triggering closeMenu
		setShowMenu(!showMenu);
	};

	useEffect(() => {
		if (!showMenu) return;

		const closeMenu = (e) => {
			if (ulRef.current && !ulRef.current.contains(e.target)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("click", closeMenu);

		return () => document.removeEventListener("click", closeMenu);
	}, [showMenu]);

	const closeMenu = () => setShowMenu(false);

	if (goHome) {
		setGoHome(false);
		return <Navigate to="/" />;
	}

	return (
		<>
			<button onClick={toggleMenu}>
				<AiOutlineUser />
			</button>
			<ul className={ulClassName} ref={ulRef}>
				{user ? (
					<>
						<li>{user.username}</li>
						<li>
							{user.firstName} {user.lastName}
						</li>
						<li>{user.email}</li>
						<li>
							<button onClick={logout}>Log Out</button>
						</li>
					</>
				) : (
					<>
						<li>
							<OpenModalButton
								buttonText="Log In"
								modalComponent={<LoginFormModal />}
								onButtonClick={closeMenu}
							/>
						</li>
						<li>
							<OpenModalButton
								buttonText="Sign Up"
								modalComponent={<SignupFormModal />}
								onButtonClick={closeMenu}
							/>
						</li>
					</>
				)}
			</ul>
		</>
	);
}

export default ProfileButton;
