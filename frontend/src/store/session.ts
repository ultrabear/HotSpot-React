import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { csrfFetch } from "./csrf";

export interface UserState {
	id: number;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
}

export interface SessionState {
	user: UserState | null;
}

const initialState: SessionState = { user: null };

export const sessionSlice = createSlice({
	name: "session",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<UserState>) => {
			state.user = action.payload;
		},
		removeUser: (state) => {
			state.user = null;
		},
	},
});

export const login = createAsyncThunk(
	"session/login",
	async (
		{ credential, password }: { credential: string; password: string },
		thunkAPI,
	) => {
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

export default sessionSlice.reducer;
