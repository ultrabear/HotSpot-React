import { useState } from "react";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";
import { useAppDispatch } from "../../store/store";

interface ErrorsTy {
	email?: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	password?: string;
	confirmPassword?: string;
}

function SignupFormModal() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState({} as ErrorsTy);
	const { closeModal } = useModal();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

	const e = (s: string): boolean => s.length === 0;

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
		<div className="Global Modal" data-testid="sign-up-form">
			<h1>Sign Up</h1>
			<form onSubmit={handleSubmit} className="Global Modal">
				<label>
					First Name
					<input
						data-testid="first-name-input"
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
						data-testid="last-name-input"
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						required
					/>
				</label>
				{errors.lastName && <p>{errors.lastName}</p>}

				<label>
					Email
					<input
						data-testid="email-input"
						type="text"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</label>
				{errors.email && (
					<p data-testid="email-error-message">{errors.email}</p>
				)}
				<label>
					Username
					<input
						data-testid="username-input"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						minLength={4}
					/>
				</label>
				{errors.username && (
					<p data-testid="username-error-message">{errors.username}</p>
				)}
				<label>
					Password
					<input
						data-testid="password-input"
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
						data-testid="confirm-password-input"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						minLength={6}
					/>
				</label>
				{errors.confirmPassword && <p>{errors.confirmPassword}</p>}
				<button
					type="submit"
					disabled={disabled}
					data-testid="form-sign-up-button"
				>
					Sign Up
				</button>
			</form>
		</div>
	);
}

export default SignupFormModal;
