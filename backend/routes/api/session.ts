import { Router } from "express";

const router = Router();

import bcrypt from "bcryptjs";
import { setTokenCookie, restoreUser } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";

router.post("/", async (req, res, next) => {
	const { credential, password } = req.body;

	const user = await prisma.user.findFirst({
		where: {
			OR: [{ username: credential }, { email: credential }],
		},
	});

	if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
		const err = new Error("Login failed");
		err.status = 401;
		err.title = "Login failed";
		err.errors = { credential: "The provided credentials were invalid" };
		return next(err);
	}

	const safeUser = {
		id: user.id,
		email: user.email,
		username: user.username,
	};

	setTokenCookie(res, safeUser);

	return res.json({
		user: safeUser,
	});
});

router.delete("/", (_req, res) => {
	res.clearCookie("token");
	return res.json({ message: "success" });
});

router.get("/", (req, res) => {
	const { user } = req;
	if (user) {
		const safeUser = {
			id: user.id,
			email: user.email,
			username: user.username,
		};
		return res.json({
			user: safeUser,
		});
	} else return res.json({ user: null });
});

export default router;
