import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import { useDispatch, useSelector } from "react-redux";

const rootReducer = combineReducers({
	session: sessionReducer,
});

let enhancer;
//@ts-ignore
if (import.meta.env.MODE === "production") {
	enhancer = applyMiddleware(thunk);
} else {
	const logger = (await import("redux-logger")).default;
	const composeEnhancers =
		window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
	enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

/**
 * @param {RootState} [preloadedState]
 */
const configureStore = (preloadedState) => {
	return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;

/**
 * @typedef {import("react").Dispatch<AnyAction>} Dispatch
 * @typedef {import("redux").AnyAction} AnyAction
 */

/**
 * @typedef {{
 * (inp:AnyAction): AnyAction;
 * <T>(inp:(_: Dispatch) => Promise<T>): Promise<T>;
 * }} DispatchTy
 */

/** @type {() => DispatchTy} */
export const useAppDispatch = useDispatch;

/**
 * @typedef {ReturnType<typeof rootReducer>} RootState
 */

/**
 * @type {<T>(_: (_: RootState) => T) => T}
 * */
export const useAppSelector = useSelector;
