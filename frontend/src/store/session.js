import { csrfFetch } from "./csrf";

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

/** @param {HotSpot.Store.User | null} user */
const setUser = (user) => {
	return {
		type: SET_USER,
		payload: user,
	};
};

const removeUser = () => {
	return {
		type: REMOVE_USER,
	};
};

/**
 * @param {Object} user
 * @param {string} user.credential
 * @param {string} user.password
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const login = (user) => async (dispatch) => {
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

/**
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const restoreUser = () => async (dispatch) => {
	const response = await csrfFetch("/api/session");
	const data = await response.json();
	dispatch(setUser(data.user));
	return response;
};

/**
 * @param {Object} user
 * @param {string} user.username
 * @param {string} user.firstName
 * @param {string} user.lastName
 * @param {string} user.email
 * @param {string} user.password
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const signup = (user) => async (dispatch) => {
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
/**
 * @returns {import("./store").ThunkDispatchFn<Response>}
 */
export const logout = () => async (dispatch) => {
	const response = await csrfFetch("/api/session", {
		method: "DELETE",
	});
	dispatch(removeUser());
	return response;
};

/**
 * @typedef {HotSpot.Store.UserState} UserState
 */

/** @type {UserState} */
const initialState = { user: null };

/**
 * @template {import("./store").AnyAction} A
 * @type {import("react").Reducer<UserState, A>}
 */
const sessionReducer = (state = initialState, action) => {
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
