import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import { PropsWithChildren, useEffect, useState } from "react";
import { restoreUser } from "./store/session";
import { useAppDispatch } from "./store/store";

const router = createBrowserRouter([
	{
		path: "/",
		element: <h1>Welcome!</h1>,
	},
	{
		path: "/login",
		element: <LoginFormPage />,
	},
]);

function Layout<U>({ children }: PropsWithChildren<U>): JSX.Element {
	const [loaded, setLoaded] = useState(false);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!loaded) {
			setLoaded(true);
			dispatch(restoreUser());
		}
	}, [dispatch, loaded]);

	if (!loaded) {
		return <h1>Logging in...</h1>;
	} else {
		return <>{children}</>;
	}
}

function App() {
	return (
		<Layout>
			<RouterProvider router={router} />
		</Layout>
	);
}

export default App;
