import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { csrfFetch } from "./csrf";
import type { PayloadAction } from "@reduxjs/toolkit";

export const login = createAsyncThunk(
	"session/login",
	async (
		user: {
			credential: string;
			password: string;
		},
		thunkAPI,
	) => {
		const { credential, password } = user;
		const response = await csrfFetch("/api/session", {
			method: "POST",
			body: JSON.stringify({
				credential,
				password,
			}),
		});
		const data = await response.json();
		thunkAPI.dispatch(sessionSlice.actions.setUser(data.user));
		return response;
	},
);

export const restoreUser = createAsyncThunk(
	"session/restore",
	async (_none: void, thunkAPI) => {
		const response = await csrfFetch("/api/session");
		const data = await response.json();
		thunkAPI.dispatch(sessionSlice.actions.setUser(data.user));
		return response;
	},
);

export const signup = createAsyncThunk(
	"session/signup",
	async (
		user: {
			username: string;
			firstName: string;
			lastName: string;
			email: string;
			password: string;
		},
		thunkAPI,
	) => {
		const { username, firstName, lastName, email, password } = user;
		const response = await csrfFetch("/api/users", {
			method: "POST",
			body: JSON.stringify({
				username,
				firstName,
				lastName,
				email,
				password,
			}),
		});
		const data = await response.json();
		thunkAPI.dispatch(sessionSlice.actions.setUser(data.user));
		return response;
	},
);

export const logout = createAsyncThunk(
	"session/logout",
	async (_: void, thunkAPI) => {
		const response = await csrfFetch("/api/session", {
			method: "DELETE",
		});
		thunkAPI.dispatch(sessionSlice.actions.removeUser());
		return response;
	},
);

type UserState = HotSpot.Store.UserState;

const initialState: UserState = { user: null };

const sessionSlice = createSlice({
	name: "session",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<HotSpot.Store.User>) => {
			state.user = action.payload;
		},

		removeUser: (state) => {
			state.user = null;
		},
	},
});

export default sessionSlice.reducer;
