import { useState } from "react";
import * as sessionActions from "../../store/session.ts";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store.ts";
import "./index.css";

function LoginFormPage() {
	const dispatch = useAppDispatch();
	const sessionUser = useAppSelector((state) => state.session.user);
	const [credential, setCredential] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({} as { credential?: string });

	if (sessionUser) return <Navigate to="/" replace={true} />;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrors({});
		try {
			await dispatch(sessionActions.login({ credential, password }));
		} catch (res: any) {
			const data = await res.json();
			if (data?.errors) setErrors(data.errors);
		}
	}

	return (
		<>
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
				{errors.credential && <p>{errors.credential}</p>}
				<button type="submit">Log In</button>
			</form>
		</>
	);
}

export default LoginFormPage;
