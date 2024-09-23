import { Router, Request, Response } from "express";
import { handleValidationErrors } from "../../utils/validation.js";
import bcrypt from "bcryptjs";
import { check } from "express-validator";

import { setTokenCookie, requireAuth } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";

const router = Router();

const validateSignup = [
	check("email")
		.exists({ checkFalsy: true })
		.isEmail()
		.withMessage("Please provide a valid email."),
	check("username")
		.exists({ checkFalsy: true })
		.isLength({ min: 4 })
		.withMessage("Please provide a username with at least 4 characters."),
	check("username").not().isEmail().withMessage("Username cannot be an email."),
	check("password")
		.exists({ checkFalsy: true })
		.isLength({ min: 6 })
		.withMessage("Password must be 6 characters or more."),
	check("firstName")
		.exists({ checkFalsy: true })
		.withMessage("firstName must be passed"),
	check("lastName")
		.exists({ checkFalsy: true })
		.withMessage("lastName must be passed"),
	handleValidationErrors,
];

router.post("/", validateSignup, async (req: Request, res: Response) => {
	const { email, password, username, firstName, lastName } = req.body;
	const hashedPassword = bcrypt.hashSync(password);
	const user = await prisma.user.create({
		data: { email, username, hashedPassword, firstName, lastName },
	});

	const safeUser = {
		id: user.id,
		email: user.email,
		username: user.username,
	};

	setTokenCookie(res, safeUser);

	return res.json({
		user: { ...safeUser, firstName, lastName },
	});
});

export default router;
