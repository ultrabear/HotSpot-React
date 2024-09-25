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
import { resourceLimits } from "node:worker_threads";

const router = Router();

router.get("/current", requireAuth, async (req, res) => {
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const user = req.user!;

	const reviews = await prisma.review.findMany({
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

		const out = {
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

router.delete("/:reviewId", requireAuth, async (req, res) => {

	const reviewId = Number(req.params["reviewId"]);
		if(isNaN(reviewId) || reviewId > 2**31) 
			res.status(404).json({message: "Review couldn't be found"})

	const userId = req.user!.id;

	try {
		const review = await prisma.review.findUnique({
			where: {
				id: reviewId,
				userId: userId,
			},
		});

		if (!review) {
			if (!(await prisma.review.findUnique({ where: { id: reviewId } }))) {
				return res.status(404).json({
					message: "Review couldn't be found"
				});
			}
			return res.status(403).json({
				message: "You are not authorized to delete this review",
			});
		}

		await prisma.review.delete({
			where: { id: reviewId },
		});
		return res.status(200).json({
			message: "Successfully deleted",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
});

export default router;



