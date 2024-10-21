import sessionReducer from "./session";
import spotsReducer from "./spots";
import { useDispatch, useSelector } from "react-redux";
import reviewsReducer from "./review";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
	reducer: {
		session: sessionReducer,
		spots: spotsReducer,
		reviews: reviewsReducer,
	},
});



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// FIXME: remove
export type ThunkDispatchFn<T> = (dispatch: AppDispatch) => Promise<T>;


export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useUser = (): HotSpot.Store.UserState["user"] =>
	useAppSelector((s) => s.session.user);
