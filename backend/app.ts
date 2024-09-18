import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";
import csurf from "csurf";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import data from "./config/index.js";
const { environment } = data;

const isProduction = environment === "production";

const app = express();
app.use(morgan("dev"));

app.use(cookieParser());

app.use(express.json());

if (!isProduction) {
	app.use(cors());
}

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
	csurf({
		cookie: {
			secure: isProduction,
			sameSite: isProduction,
			httpOnly: true,
		},
	}),
);

import { PrismaClient } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

import routes from "./routes/index.js";

app.use(routes);

app.use(async (_req, _res, next) => {
	const err = new Error("Requested resource could not be found.") as Error & {
		title: string;
		errors: { message: string };
		status: number;
	};
	err.title = "Resource not found";
	err.errors = { message: "The requested resource couldn't be found" };
	err.status = 404;
	next(err);
});

// @ts-ignore
app.use((err, _req, _res, next) => {
	if (err instanceof PrismaClientValidationError) {
		(err as any as { title: string }).title = "prisma validation error";
		(err as any as { errors: string }).errors = err.message;
	}

	next(err);
});

// @ts-ignore
app.use((err, _req, res, _next) => {
	res.status(err.status || 500);
	console.error(err);
	res.json({
		title: err.title || "Server Error",
		message: err.message,
		errors: err.errors,
		stack: isProduction ? null : err.stack,
	});
});

export { app, prisma };
