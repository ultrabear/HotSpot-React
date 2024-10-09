import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import { csrfFetch, restoreCSRF } from "./store/csrf.ts";
import * as sessionActions from "./store/session.ts";

if (import.meta.env.MODE !== "production") {
	restoreCSRF();

	(window as any).csrfFetch = csrfFetch;
	(window as any).store = store;
	(window as any).sessionActions = sessionActions;
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</StrictMode>,
);
