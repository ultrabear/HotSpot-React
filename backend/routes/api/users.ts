import { Router } from "express";

import bcrypt from "bcryptjs";

import { setTokenCookie, requireAuth } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";

const router = Router();

router.post("/", async (req, res) => {
	const { email, password, username } = req.body;
	const hashedPassword = bcrypt.hashSync(password);
	const user = await prisma.user.create({
		data: { email, username, hashedPassword },
	});

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



export default router;
