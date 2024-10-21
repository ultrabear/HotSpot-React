import { AnyAction } from "redux";
import { csrfFetch } from "./csrf";
import { ThunkDispatchFn } from "./store";

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

/** @param {HotSpot.Store.User | null} user */
function setUser(user: HotSpot.Store.User | null) {
	return {
		type: SET_USER,
		payload: user,
	};
}

const removeUser = () => {
	return {
		type: REMOVE_USER,
	};
};

export function login(user: {
	credential: string;
	password: string;
}): ThunkDispatchFn<Response> {
	return async (dispatch) => {
		const { credential, password } = user;
		const response = await csrfFetch("/api/session", {
			method: "POST",
			body: JSON.stringify({
				credential,
				password,
			}),
		});
		const data = await response.json();
		dispatch(setUser(data.user));
		return response;
	};
}

/**
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export function restoreUser(): import("./store").ThunkDispatchFn<Response> {
	return async (dispatch) => {
		const response = await csrfFetch("/api/session");
		const data = await response.json();
		dispatch(setUser(data.user));
		return response;
	};
}

/**
 * @param {Object} user
 * @param {string} user.username
 * @param {string} user.firstName
 * @param {string} user.lastName
 * @param {string} user.email
 * @param {string} user.password
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export function signup(user: {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}): import("./store").ThunkDispatchFn<Response> {
	return async (dispatch) => {
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
		dispatch(setUser(data.user));
		return response;
	};
}
/**
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export function logout(): import("./store").ThunkDispatchFn<Response> {
	return async (dispatch) => {
		const response = await csrfFetch("/api/session", {
			method: "DELETE",
		});
		dispatch(removeUser());
		return response;
	};
}

type UserState = HotSpot.Store.UserState;

/** @type {UserState} */
const initialState: UserState = { user: null };

const sessionReducer: import("react").Reducer<UserState, AnyAction> = (
	state = initialState,
	action,
) => {
	switch (action.type) {
		case SET_USER:
			return { ...state, user: action.payload };
		case REMOVE_USER:
			return { ...state, user: null };
		default:
			return state;
	}
};

export default sessionReducer;
