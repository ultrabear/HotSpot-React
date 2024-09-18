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

import routes from './routes/index.js';

app.use(routes);

export default app;
