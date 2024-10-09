import React from "react";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import configureStore from "./store";
import { createRoot } from "react-dom/client";

import { restoreCSRF, csrfFetch } from "./store/csrf";

import * as sessionActions from "./store/session"; // <-- ADD THIS LINE

const store = configureStore();

if (import.meta.env.MODE !== "production") {
	restoreCSRF();

	window.csrfFetch = csrfFetch;
	window.store = store;
	window.sessionActions = sessionActions;
}

const root = createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
);

export default root;
