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

const validateReviewImage = [
	check("url").isString().withMessage("must pass a url string"),

	handleValidationErrors,
];

router.post(
	"/:reviewId/images",
	requireAuth,
	validateReviewImage,
	async (req: Request, res: Response) => {
		const user = req.user!;
		let reviewId;
		try {
			reviewId = BigInt(req.params["reviewId"]!);

			if (BigInt.asIntN(32, reviewId) !== reviewId) {
				throw Error();
			}
		} catch (e) {
			return res.status(404).json({ message: "Review couldn't be found" });
		}
		const { url } = req.body;

		const review = await prisma.review.findFirst({
			where: { id: Number(reviewId) },
			include: { images: true },
		});

		if (review) {
			if (review.userId !== user.id) {
				return res
					.status(403)
					.json({ message: "You do not have permission to edit this review" });
			}

			if (review.images.length >= 10) {
				return res.status(403).json({
					message: "Maximum number of images for this resource was reached",
				});
			}

			let img = await prisma.reviewImage.create({
				data: {
					reviewId: review.id,
					url,
				},
			});

			return res.status(201).json({ id: img.id, url });
		} else {
			return res.status(404).json({ message: "Review couldn't be found" });
		}
	},
);

const validateReviewEdit = [
	check("review")
		.exists({ values: "falsy" })
		.isString()
		.withMessage("Review text is required"),
	check("stars")
		.exists({ values: "falsy" })
		.isInt({ min: 1, max: 5 })
		.withMessage("Stars must be an integer from 1 to 5"),

	handleValidationErrors,
];

router.put(
	"/:reviewId",
	requireAuth,
	validateReviewEdit,
	async (req: Request, res: Response) => {
		const user = req.user!;

		const { review, stars } = req.body;

		let reviewId;
		try {
			reviewId = BigInt(req.params["reviewId"]!);

			if (BigInt.asIntN(32, reviewId) !== reviewId) {
				throw Error();
			}
		} catch (e) {
			return res.status(404).json({ message: "Review couldn't be found" });
		}

		try {
			const changed = await prisma.review.update({
				data: {
					review,
					stars,
					updatedAt: new Date(),
				},
				where: { id: Number(reviewId), userId: user.id },
			});

			return res.status(200).json(changed);
		} catch (e) {
			if (await prisma.review.findFirst({ where: { id: Number(reviewId) } })) {
				return res
					.status(403)
					.json({ message: "You do not have permission to edit this review" });
			}

			return res.status(404).json({ message: "Review couldn't be found" });
		}
	},
);

export default router;
