import { Router, Request, Response, NextFunction } from "express";
import { check } from "express-validator";
import { handleValidationErrors } from "../../utils/validation.js";

const router = Router();

import bcrypt from "bcryptjs";
import { setTokenCookie, restoreUser, requireAuth } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";

router.get("/current", requireAuth, async (req, res) => {
	const user = req.user!;

	let bookings = await prisma.booking.findMany({
		where: { userId: user.id },
		include: {
			spot: {
				select: {
					images: { where: { preview: true }, select: { url: true } },
					id: true,
					ownerId: true,
					address: true,
					city: true,
					state: true,
					country: true,
					lat: true,
					lng: true,
					name: true,
					price: true,
				},
			},
		},
	});

	const sequelized = bookings.map((b) => {
		const { spot, startDate, endDate, ...rest } = b;

		const { images, ...spotRest } = spot;

		return {
			Spot: {
				previewImage: images[0]?.url ?? "",
				...spotRest,
			},
			startDate: startDate.toDateString(),
			endDate: endDate.toDateString(),
			...rest,
		};
	});

	return res.json({ Bookings: sequelized });
});

export default router;
