import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navigation from "./components/Navigation/Navigation";
import * as sessionActions from "./store/session";
import { useAppDispatch } from "./store/store";
import SpotsList from "./components/SpotsList/SpotsList";
import SpotDetails from "./components/SpotDetails/SpotDetails";
import NewSpotModal from "./components/NewSpotModal/NewSpotModal";

function Layout() {
	const dispatch = useAppDispatch();
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		dispatch(sessionActions.restoreUser()).then(() => {
			setIsLoaded(true);
		});
	}, [dispatch]);

	return (
		<>
			<Navigation isLoaded={isLoaded} />
			{isLoaded && <Outlet />}
		</>
	);
}

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{
				path: "/",
				element: (
					<>
						<h1>Welcome!</h1>
						<SpotsList />
					</>
				),
			},
			{
				path: "spots",
				element: <Outlet />,
				children: [
					{
						path: ":spotId",
						element: <SpotDetails />,
					},
				],
			},
			{
				path: "newspot",
				element: <NewSpotModal />,
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
