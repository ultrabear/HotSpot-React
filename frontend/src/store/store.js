import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import spotsReducer from "./spots";
import { useDispatch, useSelector } from "react-redux";
import reviewsReducer from "./review";

const rootReducer = combineReducers({
	session: sessionReducer,
	spots: spotsReducer,
	reviews: reviewsReducer,
});

let enhancer;
//@ts-ignore
if (import.meta.env.MODE === "production") {
	enhancer = applyMiddleware(thunk);
} else {
	//@ts-ignore
	const logger = (await import("redux-logger")).default;
	const composeEnhancers =
		//@ts-ignore
		window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
	enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}
/**
 * @typedef {ReturnType<typeof rootReducer>} RootState
 */

/**
 * @param {RootState} [preloadedState]
 */
const configureStore = (preloadedState) => {
	return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;

/**
 * @typedef {import("redux").AnyAction} AnyAction
 * @typedef {import("react").Dispatch<AnyAction>} Dispatch
 */

/**
 * @template {object} T
 * @typedef {((dispatch: Dispatch) => Promise<T>)} ThunkDispatchFn
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
 * @type {<T>(_: (_: RootState) => T) => T}
 * */
export const useAppSelector = useSelector;
/** @returns {HotSpot.Store.UserState['user']} */
export const useUser = () => useAppSelector((s) => s.session.user);
