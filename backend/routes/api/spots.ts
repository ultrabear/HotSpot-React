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
import { Booking, Spot } from "@prisma/client";

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

function parseSpotId(spotId: string | undefined, res: Response): number | null {
	try {
		if (spotId === undefined) {
			throw Error("spotid not passed");
		}

		let id = BigInt(spotId);

		if (id !== BigInt.asIntN(33, id)) {
			throw Error("overflowed u32");
		}

		return Number(id);
	} catch (e) {
		res.status(404).json({ message: "Spot couldn't be found" });
		return null;
	}
}

async function getSpot<T>(
	id: string | undefined,
	res: Response,
	cb: (id: number) => Promise<T>,
): Promise<T | null> {
	let spotId = parseSpotId(id, res);

	if (spotId) {
		let data = await cb(spotId);

		if (data) {
			return data;
		}

		res.status(404).json({ message: "Spot couldn't be found" });
		return null;
	} else {
		return null;
	}
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

const validateNewSpot = [
	check("address")
		.exists({ checkFalsy: true })
		.withMessage("Street address is required"),
	check("city").exists({ checkFalsy: true }).withMessage("City is required"),
	check("state").exists({ checkFalsy: true }).withMessage("State is required"),
	check("country")
		.exists({ checkFalsy: true })
		.withMessage("Country is required"),
	check("lat")
		.exists({ checkFalsy: true })
		.isNumeric()
		.withMessage("Latitude is not valid"),
	check("lng")
		.exists({ checkFalsy: true })
		.isNumeric()
		.withMessage("Longitude is not valid"),
	check("name")
		.exists({ checkFalsy: true })
		.isLength({ max: 50 })
		.withMessage("Name must be less than 50 characters"),
	check("description")
		.exists({ checkFalsy: true })
		.withMessage("Description is required"),
	check("price")
		.exists({ checkFalsy: true })
		.isNumeric()
		.withMessage("Price per day is required"),

	handleValidationErrors,
];

router.get("/:spotId", async (req, res) => {
	const spot = await getSpot(req.params.spotId, res, (spotId) =>
		prisma.spot.findFirst({
			where: { id: spotId },
			include: {
				images: { select: { id: true, url: true, preview: true } },
				reviews: { select: { stars: true } },
				owner: {
					select: { id: true, firstName: true, lastName: true },
				},
			},
		}),
	);

	if (!spot) {
		return;
	}

	const { reviews, images, owner, ...rest } = spot;

	return res.json({
		...rest,
		numReviews: reviews.length,
		avgStarRating: reviews.reduce((a, i) => a + i.stars, 0) / reviews.length,
		SpotImages: images,
		Owner: owner,
	});
});

router.put(
	"/:spotId",
	requireAuth,
	validateNewSpot,
	async (req: Request, res: Response) => {
		let user = req.user!;

		const {
			address,
			city,
			state,
			country,
			lat,
			lng,
			name,
			description,
			price,
		} = req.body;

		const spot = await getSpot(req.params["spotId"], res, (id) =>
			prisma.spot.findUnique({ where: { id } }),
		);

		if (!spot) {
			return;
		}

		if (spot.ownerId !== user.id) {
			return res
				.status(403)
				.json({ message: "You do not have permission to edit this spot" });
		}

		let updated = await prisma.spot.update({
			where: { id: spot.id },
			data: {
				address,
				city,
				state,
				country,
				lat,
				lng,
				name,
				description,
				price,
				updatedAt: new Date(),
			},
		});

		return res.status(200).json({ ...updated, lat, lng, price });
	},
);

router.delete("/:spotId", requireAuth, async (req, res) => {
	let user = req.user!;

	const spot = await getSpot(req.params["spotId"], res, (spotId) =>
		prisma.spot.findFirst({
			where: { id: spotId },
			select: { id: true, ownerId: true },
		}),
	);

	if (!spot) {
		return;
	}

	if (spot.ownerId !== user.id) {
		return res
			.status(403)
			.json({ message: "You do not have permission to delete this spot" });
	}

	await prisma.spot.delete({ where: { id: spot.id } });

	return res.status(200).json({ message: "Sucessfully deleted" });
});

/*router.get("/:spotId/bookings", requireAuth, async (req, res) => {
	const user = req.user!;

	const spot = await getSpot(req.params["spotId"], res, (id) =>
		prisma.spot.findUnique({ where: { id } }),
	);

	if (!spot) {
		return;
	}

	if (spot.ownerId == user.id) {


		
	}


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
});*/

router.get("/:spotId/reviews", async (req, res) => {
	const spot = await getSpot(req.params.spotId, res, (id) =>
		prisma.spot.findUnique({ where: { id } }),
	);

	if (!spot) {
		return;
	}

	const reviews = await prisma.review.findMany({
		where: { spotId: spot.id },
		include: {
			user: { select: { id: true, firstName: true, lastName: true } },
			images: { select: { id: true, url: true } },
		},
	});

	const out = reviews.map((r) => {
		const { user, images, ...rest } = r;

		return {
			User: user,
			ReviewImages: images,
			...rest,
		};
	});

	return res.json({ Reviews: out });
});

const validateNewReview = [
	check("review")
		.exists({ checkFalsy: true })
		.isString()
		.withMessage("Review text is required"),
	check("stars").exists({ checkFalsy: true }).isInt({ min: 1, max: 5 }),

	handleValidationErrors,
];

router.post(
	"/:spotId/reviews",
	requireAuth,
	validateNewReview,
	async (req: Request, res: Response) => {
		const user = req.user!;

		const { review, stars } = req.body;

		const spot = await getSpot(req.params["spotId"], res, (spotId) =>
			prisma.spot.findFirst({
				where: { id: spotId },
				include: { reviews: { where: { userId: user.id } } },
			}),
		);

		if (!spot) {
			return;
		}

		if (spot.reviews.length) {
			return res
				.status(500)
				.json({ message: "User already has a review for this spot" });
		}

		const rev = await prisma.review.create({
			data: {
				userId: user.id,
				spotId: spot.id,
				review: String(review),
				stars: Number(stars),
			},
		});

		return res.status(201).json(rev);
	},
);

const validateNewSpotImage = [
	check("url").exists({ checkFalsy: true }).withMessage("URL is required"),
	check("preview")
		.exists({ checkFalsy: true })
		.isBoolean()
		.withMessage("Preview flag is required"),

	handleValidationErrors,
];

router.post(
	"/:spotId/images",
	requireAuth,
	validateNewSpotImage,
	async (req: Request, res: Response) => {
		const user = req.user!;

		const { url, preview } = req.body;

		let spot = await getSpot(req.params["spotId"], res, (spotId) =>
			prisma.spot.findFirst({ where: { id: spotId } }),
		);

		if (!spot) {
			return;
		}

		if (spot.ownerId !== user.id) {
			return res
				.status(403)
				.json({ message: "You do not have permission to modify this spot" });
		}

		const img = await prisma.spotImage.create({
			data: { url, preview, spotId: spot.id },
		});

		return res.status(201).json({ id: img.id, url, preview });
	},
);

const validateNewBooking = [
	check("startDate")
		.exists({ checkFalsy: true })
		.isDate()
		.withMessage("startDate is required"),
	check("endDate")
		.exists({ checkFalsy: true })
		.isDate()
		.withMessage("endDate is required"),

	handleValidationErrors,
];

function bookingOverlap(
	spot: number,
	start: Date,
	end: Date,
): Promise<Booking | null> {
	return prisma.booking.findFirst({
		where: {
			spotId: spot,
			endDate: { gte: start },
			startDate: { lte: end },
		},
	});
}

router.post("/:spotId/bookings", requireAuth, async (req, res, next) => {
	const { startDate: sd, endDate: ed } = req.body;
	const startDate = new Date(sd);
	const endDate = new Date(ed);

	if (startDate >= endDate) {
		return res.status(400).json({
			message: "Bad Request",
			errors: { endDate: "endDate cannot be on or before startDate" },
		});
	}

	const user = req.user!;

	const spot = await getSpot(req.params["spotId"], res, (id) =>
		prisma.spot.findUnique({ where: { id } }),
	);

	if (!spot) {
		return;
	}

	if (spot.ownerId == user.id) {
		return res.status(403).json({
			message: "You own this spot, and cannot make a booking for it",
		});
	}

	let overlap = await bookingOverlap(spot.id, startDate, endDate);

	if (overlap) {
		let err: {
			message: string;
			errors: { startDate?: string; endDate?: string };
		} = {
			message: "Sorry, this spot is already booked for the specified dates",
			errors: {},
		};

		if (overlap.startDate <= startDate && startDate <= overlap.endDate) {
			err.errors.startDate = "Start date conflicts with an existing booking";
		}
		if (overlap.startDate <= endDate && endDate <= overlap.endDate) {
			err.errors.endDate = "End date conflicts with an existing booking";
		}

		return res.status(403).json(err);
	}

	let booking = await prisma.booking.create({
		data: {
			userId: user.id,
			spotId: spot.id,
			startDate,
			endDate,
		},
	});

	return res.status(201).json({
		...booking,
		startDate: booking.startDate.toISOString().split("T")[0],
		endDate: booking.endDate.toISOString().split("T")[0],
	});
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

router.post(
	"/",
	requireAuth,
	validateNewSpot,
	async (req: Request, res: Response) => {
		let user = req.user!;

		const {
			address,
			city,
			state,
			country,
			lat,
			lng,
			name,
			description,
			price,
		} = req.body;

		const spot = await prisma.spot.create({
			data: {
				ownerId: user.id,
				address,
				city,
				state,
				country,
				lat,
				lng,
				name,
				description,
				price,
			},
		});

		return res.status(201).json({ ...spot, lat, lng, price });
	},
);

export default router;
