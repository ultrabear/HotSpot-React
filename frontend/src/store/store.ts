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

export type RootState = ReturnType<typeof rootReducer>

const configureStore = (preloadedState?: RootState) => {
	return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;



type AnyAction = import("redux").AnyAction;

type Dispatch = import("react").Dispatch<AnyAction>;

export type ThunkDispatchFn<T> = (dispatch: Dispatch) => Promise<T>;

type DispatchTy = {
	(inp: AnyAction): AnyAction;
	<T>(inp: (_: Dispatch) => Promise<T>): Promise<T>;
};

export const useAppDispatch: () => DispatchTy = useDispatch;

export const useAppSelector: <T>(_: (_: RootState) => T) => T = useSelector;
export const useUser = (): HotSpot.Store.UserState['user'] => useAppSelector((s) => s.session.user);
