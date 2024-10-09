import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "./session";
import { useDispatch, useSelector, useStore } from "react-redux";

export const store = configureStore({
	reducer: {
		session: sessionReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
