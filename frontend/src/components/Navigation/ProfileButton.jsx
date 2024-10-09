import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { AiOutlineUser } from "react-icons/ai";

function ProfileButton({ user }) {
	const dispatch = useDispatch();

	const logout = (e) => {
		e.preventDefault();
		dispatch(sessionActions.logout());
	};

	return (
		<>
			<button>
				<AiOutlineUser />
			</button>
			<ul className="profile-dropdown">
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
