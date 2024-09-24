import { Router, Request, Response, NextFunction } from "express";
import { handleValidationErrors } from "../../utils/validation.js";
import bcrypt from "bcryptjs";
import { check } from "express-validator";

import { setTokenCookie, requireAuth } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { Spot } from "@prisma/client";

const router = Router();

router.get("/current", requireAuth, async (req, res) => {
	let user = req.user!;

	let reviews = await prisma.review.findMany({
		where: { id: user.id },
		include: {
			spot: {
				include: {
					images: { where: { preview: true }, select: { url: true } },
				},
			},
			images: { select: { url: true, id: true } },
		},
	});

	const sequelized = reviews.map((r) => {
		const { spot, images, ...rest } = r;

		const { images: spotImages, lat, lng, price, ...restSpot } = spot;

		let out = {
			User: { id: user.id, firstName: user.firstName, lastName: user.lastName },
			Spot: {
				...restSpot,
				lat: Number(lat),
				lng: Number(lng),
				price: Number(price),
				previewImage: spotImages[0]?.url,
			},

			ReviewImages: images,

			...rest,
		};

		return out;
	});

	return res.json({ Reviews: sequelized });
});







export default router;
