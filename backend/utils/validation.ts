import { Request, Response, NextFunction } from "express";

import { validationResult } from "express-validator";

export function handleValidationErrors(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		const errors = {};

		validationErrors
			.array()
			//@ts-ignore
			.forEach((error) => (errors[error.path] = error.msg));

		const err = Error("Bad Request");
		err.errors = errors;
		err.status = 400;
		err.title = "Bad Request";
		next(err);
	}
	next();
}
