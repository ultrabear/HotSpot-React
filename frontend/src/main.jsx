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

//@ts-ignore
if (import.meta.env.MODE !== "production") {
	restoreCSRF();

	//@ts-ignore
	window["csrfFetch"] = csrfFetch;
	//@ts-ignore
	window["store"] = store;
	//@ts-ignore
	window["sessionActions"] = sessionActions;
}

/**
 * @template {any} T
 * @param {T | null} a
 * @returns {T}
 * */
const assume = (a) => /** @type {T} */ (a);

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
