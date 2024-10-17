import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/store";
import { useModal } from "../../context/Modal";

function NewSpotModal() {
	const dispatch = useAppDispatch();
	const [formInput, setFormInput] = useState({
		country: "",
		address: "",
		city: "",
		state: "",
		lat: "",
		lng: "",
		description: "",
		name: "",
		price: "",
		previewImage: "",
	});
	const [imageSlots, setImageSlots] = useState(["", "", "", ""]);
	const [errors, setErrors] = useState(/** @type {{message?: string}} */ ({}));
	const [vErrs, setVErrs] = useState(
		/** @type {{pass?: string, user?: string}} */ ({}),
	);

	/**  @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e */
	const handleChange = (e) => {
		setFormInput({
			...formInput,
			[e.target.name]: e.target.value,
		});
	};

	/**
	 * @param {React.FormEvent<HTMLFormElement>} e
	 */
	const handleSubmit = (e) => {
		e.preventDefault();
	};
	return (
		<>
			<h1>Create a new Spot</h1>
			<form onSubmit={handleSubmit}>
				<h2>Where's your place located?</h2>
				<p>
					Guests will only get your exact address once they booked a
					reservation.
				</p>
				Country
				<input
					type="text"
					name="country"
					value={formInput["country"]}
					placeholder="Country"
					onChange={handleChange}
				/>
				Street Address
				<input
					type="text"
					name="address"
					value={formInput["address"]}
					placeholder="Address"
					onChange={handleChange}
				/>
				City
				<input
					type="text"
					name="city"
					value={formInput["city"]}
					placeholder="City"
					onChange={handleChange}
				/>
				State
				<input
					type="text"
					name="state"
					value={formInput["state"]}
					placeholder="State"
					onChange={handleChange}
				/>
				Latitude
				<input
					type="text"
					name="lat"
					value={formInput["lat"]}
					placeholder="Latitude"
					onChange={handleChange}
				/>
				Longitude
				<input
					type="text"
					name="lng"
					value={formInput["lng"]}
					placeholder="Longitude"
					onChange={handleChange}
				/>
				<h2>Describe your place to guests</h2>
				<p>
					Mention the best features of your space, any special amenities like
					fast wifi or parking, and what you love about the neighborhood
				</p>
				<textarea
					name="description"
					value={formInput["description"]}
					placeholder="Please write at least 30 characters"
					onChange={handleChange}
				/>
				<h2>Create a title for your spot</h2>
				<p>
					Catch guests' attention with a spot title that highlights what makes
					your place special
				</p>
				<input
					type="text"
					name="name"
					value={formInput["name"]}
					placeholder="Name of your spot"
					onChange={handleChange}
				/>
				<h2>Set a base price for your spot</h2>
				<p>
					Competitive pricing can help your listing stand out and rank higher in
					search results
				</p>
				$
				<input
					type="text"
					name="price"
					value={formInput["price"]}
					placeholder="Price per night (USD)"
					onChange={handleChange}
				/>
				<h2>Liven up your spot with photos</h2>
				<p>Submit a link to at least one photo to publish your spot</p>
				<input
					type="text"
					name="previewImage"
					value={formInput["previewImage"]}
					placeholder="Preview Image URL"
					onChange={handleChange}
				/>
				{imageSlots.map((img, idx) => (
					<input
						type="text"
						key={idx}
						name={String(idx)}
						value={img}
						placeholder="Image URL"
						onChange={(e) =>
							setImageSlots(
								imageSlots.map((i, idx) =>
									idx === Number(e.target.name) ? e.target.value : i,
								),
							)
						}
					/>
				))}

				<button type="submit">Create Spot</button>
			</form>
		</>
	);
}

export default NewSpotModal;
