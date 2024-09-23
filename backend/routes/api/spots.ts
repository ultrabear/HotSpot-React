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

function transformSpot(
	wholeSpot: Spot & {
		reviews: { stars: number }[];
		images: { url: string }[];
	},
): object {
	const { images, reviews, lat, lng, price, ...spot } = wholeSpot;

	return {
		...spot,
		// sequelize is wrong and they codified that in the API
		// whoops!
		lat: Number(lat),
		lng: Number(lng),
		price: Number(price),
		previewImage: images[0]?.url ?? "",
		avgRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
	};
}

router.get("/current", requireAuth, async (req, res) => {
	const allSpots = await prisma.spot.findMany({
		where: { ownerId: req.user!.id },
		include: {
			images: { where: { preview: true }, select: { url: true } },
			reviews: { select: { stars: true } },
		},
	});

	const modspots = allSpots.map(transformSpot);

	res.json({ Spots: modspots });
});

router.get("/:spotId", async (req, res) => {
	let spot = await prisma.spot.findFirst({
		where: { id: Number(req.params.spotId) },
		include: {
			images: { select: { id: true, url: true, preview: true } },
			reviews: { select: { stars: true } },
			owner: {
				select: { id: true, firstName: true, lastName: true },
			},
		},
	});

	if (spot) {
		const { reviews, images, owner, ...rest } = spot;

		return res.json({
			...rest,
			numReviews: reviews.length,
			avgStarRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
			SpotImages: images,
			Owner: owner,
		});
	} else {
		return res.status(404).json({ message: "Spot couldn't be found" });
	}
});

router.get("/", async (req, res) => {
	const allSpots = await prisma.spot.findMany({
		include: {
			images: { where: { preview: true }, select: { url: true } },
			reviews: { select: { stars: true } },
		},
	});

	const modspots = allSpots.map(transformSpot);

	res.json({ Spots: modspots });
});
export default router;
