import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { AiOutlineUser } from "react-icons/ai";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function ProfileButton({ user }) {
	const dispatch = useDispatch();
	const [showMenu, setShowMenu] = useState(false);

	const ulRef = useRef();

	const logout = (e) => {
		e.preventDefault();
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

	return (
		<>
			<button onClick={toggleMenu}>
				<AiOutlineUser />
			</button>
			<ul className={ulClassName} ref={ulRef}>
				<li>{user.username}</li>
				<li>
					{user.firstName} {user.lastName}
				</li>
				<li>{user.email}</li>
				<li>
					<button onClick={logout}>Log Out</button>
				</li>
			</ul>
		</>
	);
}

export default ProfileButton;
