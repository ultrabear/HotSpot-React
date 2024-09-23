import express from "express";
const router = express.Router();

import api from "./api.js";

router.use("/api", api);

router.get("/api/csrf/restore", (req, res) => {
	const csrfToken = req.csrfToken();
	res.cookie("XSRF-TOKEN", csrfToken);
	res.status(200).json({
		"XSRF-Token": csrfToken,
	});
});

export default router;
