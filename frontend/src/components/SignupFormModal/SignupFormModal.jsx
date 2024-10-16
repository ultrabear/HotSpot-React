import { useState } from "react";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";
import { useAppDispatch } from "../../store/store";

/**
 * @typedef {Object} ErrorsTy
 * @property {string} [email]
 * @property {string} [username]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [password]
 * @property {string} [confirmPassword]
 */

function SignupFormModal() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState(/** @type {ErrorsTy} */ ({}));
	const { closeModal } = useModal();

	/**
	 * @param {React.FormEvent<HTMLFormElement>} e
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
		if (password === confirmPassword) {
			setErrors({});

			return dispatch(
				sessionActions.signup({
					email,
					username,
					firstName,
					lastName,
					password,
				}),
			)
				.then(closeModal)
				.catch(async (res) => {
					const data = await res.json();
					if (data?.errors) {
						setErrors(data.errors);
					}
				});
		}
		return setErrors({
			confirmPassword:
				"Confirm Password field must be the same as the Password field",
		});
	};

	/**
	 * @param {string} s
	 * @returns {boolean}
	 * */
	const e = (s) => s.length === 0;

	const disabled =
		e(email) ||
		e(username) ||
		e(firstName) ||
		e(lastName) ||
		e(password) ||
		e(confirmPassword) ||
		username.length < 4 ||
		password.length < 6 ||
		confirmPassword.length < 6;

	return (
		<>
			<h1>Sign Up</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Email
					<input
						type="text"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</label>
				{errors.email && <p>{errors.email}</p>}
				<label>
					Username
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						minLength={4}
					/>
				</label>
				{errors.username && <p>{errors.username}</p>}
				<label>
					First Name
					<input
						type="text"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						required
					/>
				</label>
				{errors.firstName && <p>{errors.firstName}</p>}
				<label>
					Last Name
					<input
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						required
					/>
				</label>
				{errors.lastName && <p>{errors.lastName}</p>}
				<label>
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={6}
					/>
				</label>
				{errors.password && <p>{errors.password}</p>}
				<label>
					Confirm Password
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						minLength={6}
					/>
				</label>
				{errors.confirmPassword && <p>{errors.confirmPassword}</p>}
				<button type="submit" disabled={disabled}>
					Sign Up
				</button>
			</form>
		</>
	);
}

export default SignupFormModal;
