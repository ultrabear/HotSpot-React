declare namespace HotSpot {
	interface TimeStamps {
		createdAt: Date;
		updatedAt: Date;
	}

	interface WeakTimeStamps {
		createdAt: string;
		updatedAt: string;
	}

	namespace Store {
		interface User {
			username: string;
			email: string;
			firstName: string;
			lastName: string;
			id: number;
		}

		interface UserState {
			user: User | null;
		}

		interface Image {
			id: number;
			url: URL;
		}

		interface SpotImage extends Image {
			spotId: number;
			preview: boolean;
		}

		interface ReviewImage extends Image {
			reviewId: number;
		}

		interface Spot extends TimeStamps {
			id: SpotId;
			ownerId: number;
			address: string;
			city: string;
			state: string;
			country: string;
			lat: number;
			lng: number;
			name: string;
			description: string;
			price: number;

			// below fields are all conditional on partial data processing
			partial: boolean;

			images: { [key: number]: SpotImage };
			previewImage?: URL;
			avgRating?: number;
			numReviews?: number;
			owner?: { id: number; firstName: string; lastName: string };
		}

		interface Review extends TimeStamps {
			id: ReviewId;
			spotId: number;
			user: { id: number; firstName: string; lastName: string };
			review: string;
			stars: number;
			images: ReviewImage[];
		}

		type ReviewId = number;
		type SpotId = number;

		interface SpotState {
			[spotId: SpotId]: Spot;
		}

		interface ReviewState {
			all: { [reviewId: ReviewId]: Review };
			map: { [spotId: SpotId]: Set<ReviewId> };
		}
	}

	namespace API {
		interface MinSpot extends WeakTimeStamps {
			id: number;
			lat: number;
			lng: number;
			price: number;
			ownerId: number;
			address: string;
			city: string;
			state: string;
			country: string;
			name: string;
			description: string;
		}

		interface SingleSpot extends MinSpot {
			avgStarRating: number | null;

			Owner: { id: number; firstName: string; lastName: string };
			numReviews: number;
			SpotImages: { id: number; url: string; preview: boolean }[];
		}

		interface BulkSpot extends MinSpot {
			avgRating: number | null;

			previewImage: string;
		}

		interface AllSpots {
			Spots: BulkSpot[];
			page: number;
			size: number;
		}

		interface SpotReview extends WeakTimeStamps {
			id: number;
			review: string;
			spotId: number;
			userId: number;
			stars: number;
			User: {
				id: number;
				firstName: string;
				lastName: string;
			};
			ReviewImages: {
				id: number;
				url: string;
			}[];
		}

		interface SpotReviews {
			Reviews: SpotReview[];
		}
	}
}
