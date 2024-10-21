import * as sessionActions from "../../store/session";
import { AiOutlineUser } from "react-icons/ai";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import { useAppDispatch } from "../../store/store";
import { Link, useNavigate } from "react-router-dom";

function ProfileButton({ user }: { user: HotSpot.Store.User | null; }) {
	const dispatch = useAppDispatch();
	const [showMenu, setShowMenu] = useState(false);
	const [goHome, setGoHome] = useState(false);
	const nav = useNavigate();

	const ulRef: React.MutableRefObject<HTMLUListElement | null> = useRef(null);

	const logout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		setGoHome(true);
		dispatch(sessionActions.logout());
	};

	const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

	const toggleMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation(); // Keep click from bubbling up to document and triggering closeMenu
		setShowMenu(!showMenu);
	};

	useEffect(() => {
		if (!showMenu) return;

		const closeMenu = (e: MouseEvent) => {
			//@ts-expect-error e.target is a thing i hope
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
		setShowMenu(false);
		nav("/");
	}

	return (
		<>
			<button onClick={toggleMenu}>
				<AiOutlineUser />
			</button>
			<ul className={ulClassName} ref={ulRef} data-testid="user-dropdown-menu">
				{user ? (
					<>
						<li>Hello, {user.firstName}.</li>
						<li>{user.email}</li>
						<li>
							<Link to="/spots/current" data-testid="manage-spots-link">Manage Spots</Link>
						</li>
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
