import { useEffect, useState } from "react";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
import { useAppDispatch } from "../../store/store";

function LoginFormModal() {
	const dispatch = useAppDispatch();
	const [credential, setCredential] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState(/** @type {{message?: string}} */ ({}));
	const [vErrs, setVErrs] = useState(
		/** @type {{pass?: string, user?: string}} */ ({}),
	);
	const { closeModal } = useModal();

	/**
	 * @param {React.FormEvent<HTMLFormElement>} e
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
		setErrors({});
		return dispatch(sessionActions.login({ credential, password }))
			.then(closeModal)
			.catch(async (res) => {
				const data = await res.json();
				if (data) {
					setErrors(data);
				}
			});
	};

	useEffect(() => {
		/** @type {typeof vErrs} */
		let err = {};

		if (credential.length !== 0 && credential.length < 4) {
			err.user = "Login credential must be at least 4 characters";
		}

		if (password.length !== 0 && password.length < 6) {
			err.pass = "Password must be at least 6 characters";
		}

		setVErrs(err);
	}, [credential, password]);

	/** @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} e */
	function demoLogin(e) {
		e.preventDefault();

		return dispatch(
			sessionActions.login({
				credential: "Demo-lition",
				password: "password1",
			}),
		).then(closeModal);
	}

	return (
		<div className="Global Modal">
			<h1>Log In</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Username or Email
					<input
						type="text"
						value={credential}
						onChange={(e) => setCredential(e.target.value)}
						required
					/>
				</label>
				<label>
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				<button type="submit" disabled={Object.keys(vErrs).length !== 0}>
					Log In
				</button>
				{errors.message && (
					<p className="error">The provided credentials were invalid</p>
				)}
				{vErrs.user && <p className="error">{vErrs.user}</p>}
				{vErrs.pass && <p className="error">{vErrs.pass}</p>}
			</form>
			<button onClick={demoLogin}>Login as Demo</button>
		</div>
	);
}

export default LoginFormModal;
