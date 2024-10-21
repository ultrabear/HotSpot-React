// frontend/src/store/csrf.js

import Cookies from "js-cookie";

export const csrfFetch: typeof fetch = async (url: string, options = {}) => {
	// set options.method to 'GET' if there is no method
	options.method = options.method || "GET";
	// set options.headers to an empty object if there is no headers
	options.headers = options.headers || {};

	// if the options.method is not 'GET', then set the "Content-Type" header to
	// "application/json", and set the "XSRF-TOKEN" header to the value of the
	// "XSRF-TOKEN" cookie
	if (options.method.toUpperCase() !== "GET") {
		//@ts-expect-error aa crap
		options.headers["Content-Type"] =
			//@ts-expect-error aa crap
			options.headers["Content-Type"] || "application/json";
		//@ts-expect-error aa crap
		options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
	}
	// call the default window's fetch with the url and the options passed in
	const res = await window.fetch(url, options);

	// if the response status code is 400 or above, then throw an error with the
	// error being the response
	if (res.status >= 400) throw res;

	// if the response status code is under 400, then return the response to the
	// next promise chain
	return res;
};

export function restoreCSRF() {
	return csrfFetch("/api/csrf/restore");
}

export async function jsonPost(
	url: string,
	body: object,
	method: string = "POST",
): Promise<Response> {
	return csrfFetch(url, {
		method,
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	});
}
