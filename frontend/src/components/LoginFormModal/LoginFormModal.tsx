import { useEffect, useState } from "react";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
import { useAppDispatch } from "../../store/store";

function LoginFormModal() {
	const dispatch = useAppDispatch();
	const [credential, setCredential] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({} as { message?: string });
	const [vErrs, setVErrs] = useState({} as { pass?: string; user?: string });
	const { closeModal } = useModal();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		dispatch(sessionActions.login({ credential, password }))
			.then(closeModal)
			.catch(async (res) => {
				const data = await res.json();
				if (data) {
					setErrors(data);
				}
			});
	};

	useEffect(() => {
		const err: typeof vErrs = {};

		if (credential.length !== 0 && credential.length < 4) {
			err.user = "Login credential must be at least 4 characters";
		}

		if (password.length !== 0 && password.length < 6) {
			err.pass = "Password must be at least 6 characters";
		}

		setVErrs(err);
	}, [credential, password]);

	function demoLogin(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		e.preventDefault();

		return dispatch(
			sessionActions.login({
				credential: "Demo-lition",
				password: "password",
			}),
		).then(closeModal);
	}

	return (
		<div className="Global Modal" data-testid="login-modal">
			<h1>Log In</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Username or Email
					<input
						data-testid="credential-input"
						type="text"
						value={credential}
						onChange={(e) => setCredential(e.target.value)}
						required
					/>
				</label>
				<label>
					Password
					<input
						data-testid="password-input"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				<div style={{ margin: "auto" }}>
					<button
						type="submit"
						disabled={
							Object.keys(vErrs).length !== 0 ||
							password.length === 0 ||
							credential.length === 0
						}
						data-testid="login-button"
					>
						Log In
					</button>
				</div>
				{errors.message && (
					<p className="error">The provided credentials were invalid</p>
				)}
				{vErrs.user && <p className="error">{vErrs.user}</p>}
				{vErrs.pass && <p className="error">{vErrs.pass}</p>}
			</form>
			<button onClick={demoLogin} data-testid="demo-user-login">
				Login as Demo User
			</button>
		</div>
	);
}

export default LoginFormModal;
