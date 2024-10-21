import React from "react";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import configureStore from "./store";
import { createRoot } from "react-dom/client";

import { restoreCSRF, csrfFetch } from "./store/csrf";

import * as sessionActions from "./store/session"; // <-- ADD THIS LINE
import { Modal, ModalProvider } from "./context/Modal";

const store = configureStore();

if (import.meta.env.MODE !== "production") {
	restoreCSRF();

	//@ts-expect-error aa crap
	window["csrfFetch"] = csrfFetch;
	//@ts-expect-error aa crap
	window["store"] = store;
	//@ts-expect-error aa crap
	window["sessionActions"] = sessionActions;
}

function assume<T>(a: T | null): T {
	return a as T;
}

const root = createRoot(assume(document.getElementById("root"))).render(
	<React.StrictMode>
		<ModalProvider>
			<Provider store={store}>
				<App />
				<Modal />
			</Provider>
		</ModalProvider>
	</React.StrictMode>,
);

export default root;
