import { useState } from "react";
import { useUser } from "../../store/store";
import { jsonPost } from "../../store/csrf";
import { useNavigate } from "react-router-dom";
import { TextInput, FormSection } from "./TextInput";

import "./SpotForm.css";

/**
 * @param {Record<string, string | number>} details
 * @param {string[]} imgUrls
 * @returns {Promise<number>}
 *
 */
const createSpot = async (details, imgUrls) => {
	const res = await jsonPost("/api/spots", details);

	const spot = await res.json();

	const images = imgUrls.map((url, idx) =>
		jsonPost(`/api/spots/${spot.id}/images`, { url, preview: idx === 0 }),
	);

	await Promise.all(images);

	return spot.id;
};

function NewSpotModal() {
	const [formInput, setFormInput] = useState({
		country: "",
		address: "",
		city: "",
		state: "",
		description: "",
		name: "",
		price: "",
		previewImage: "",
	});
	const [imageSlots, setImageSlots] = useState(["", "", "", ""]);
	const [escape, setEscape] = useState(/** @type {false | number} */ (false));
	const [errors, setErrors] = useState(
		/** @type {Record<string, string>} */ ({}),
	);
	const [vErrs, setVErrs] = useState(
		/** @type {{
		 country?: string,
		 address?: string,
		 city?: string,
		 state?: string,
		 description?: string,
		 name?: string,
		 price?: string,
		 previewImage?: string,
		}} */ ({}),
	);
	const nav = useNavigate();

	/**
	 * @param {unknown} v
	 * @returns { true | string }
	 */

	const numcheck = (v) => (isNaN(Number(v)) ? "Price per night is required" : true);

	/**
	 * @type {Record<string, (v: string) => true | string>}
	 */
	const validators = {
		description: (v) => (v.length >= 30 ? true : "Description needs 30 or more characters"),
		price: numcheck,
	};

	const snowFlakes = {
		description: "Description needs 30 or more characters",
		price: "Price per night is required",
		previewImage: "Preview Image URL is required",

	};

	const user = useUser();

	if (!user) {
		return <h1>Error: you cannot create a spot without an account!</h1>;
	}

	/**  @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e
	 * @param {string} pretty
	 * */
	const handleChange = (e, pretty) => {
		const val = e.target.value;
		const name = e.target.name;

		setVErrs(handleChangeInner(name, val, pretty, vErrs));
	};

	/**
	 * @param {string} name
	 * @param {string} val
	 * @param {string} pretty
	 * @param {any} vErrs
	 * */
	const handleChangeInner = (name, val, pretty, vErrs) => {
		setFormInput({
			...formInput,
			[name]: val,
		});

		const vname = name in validators ? validators[name](val) : true;

		const fmt = vname !== true ? ` ${vname}` : "";

		let last = fmt.length ? fmt : `${pretty} is required`

		if (name in snowFlakes) {
			//@ts-ignore
			last = snowFlakes[name];
		}



		if (val.length === 0 || vname !== true) {
			return { ...vErrs, [name]: last };
		} else {
			const rest = { ...vErrs };
			//@ts-ignore
			delete rest[name];
			return rest;
		}
	};

	/**
	 * @param {React.FormEvent<HTMLFormElement>} e
	 */
	const handleSubmit = (e) => {
		e.preventDefault();

		const forms = Object.entries({
			country: "Country",
			address: "Address",
			city: "City",
			state: "State",
			description: "Description",
			name: "Name",
			price: "Price",
			previewImage: "Preview Image",
		});

		let errs = {};

		for (const data of forms) {
			const [name, pretty] = data;

			//@ts-ignore
			errs = handleChangeInner(name, formInput[name], pretty, errs);
		}

		setVErrs(errs);

		if (Object.keys(errs).length !== 0) {
			return;
		}

		const { price, previewImage, ...rest } = formInput;

		createSpot({ lat: 10, lng: 10, price: Number(price), ...rest }, [
			previewImage,
			...imageSlots.filter((s) => s.length),
		])
			.then(setEscape)
			.catch(async (e) => {
				setErrors((await e.json()).errors);
			});
	};

	const extra = { formInput, handleChange, vErrs };

	if (escape !== false) {
		nav(`/spots/${escape}`);
	}

	return (
		<div className="SpotForm">
			<h1 data-testid="form-title">Create a New Spot</h1>
			<ul className="Global errors">
				{Object.entries(errors).map(([k, v]) => (
					<h3 key={k}>{v}</h3>
				))}
			</ul>
			<form onSubmit={handleSubmit} data-testid="create-spot-form">
				<FormSection
					index={1}
					heading="Where's your place located?"
					caption="Guests will only get your exact address once they booked a reservation."
				>
					<TextInput frontName="Country" backName="country" extra={extra} />
					<TextInput
						frontName="Street Address"
						backName="address"
						extra={extra}
					/>
					<TextInput frontName="City" backName="city" extra={extra} />
					<TextInput frontName="State" backName="state" extra={extra} />
				</FormSection>
				<FormSection
					index={2}
					heading="Describe your place to guests"
					caption={
						"Mention the best features of your space, any special amenities " +
						"like fast wifi or parking, and what you love about the neighborhood."
					}
				>
					<textarea
						name="description"
						value={formInput["description"]}
						placeholder="Please write at least 30 characters"
						onChange={(e) => handleChange(e, "description")}
					/>
					<span className="Global errors">
						{extra.vErrs["description"] ? extra.vErrs["description"] : false}
					</span>
				</FormSection>
				<FormSection
					index={3}
					heading="Create a title for your spot"
					caption="Catch guests' attention with a spot title that highlights what makes your place special."
				>
					<TextInput
						frontName=""
						backName="name"
						place="Name of your spot"
						extra={extra}
					/>
				</FormSection>
				<FormSection
					index={4}
					heading="Set a base price for your spot"
					caption="Competitive pricing can help your listing stand out and rank higher in search results."
				>
					$
					<TextInput
						frontName=""
						backName="price"
						place="Price per night (USD)"
						extra={extra}
						customType="number"
					/>
				</FormSection>
				<FormSection
					index={5}
					heading="Liven up your spot with photos"
					caption="Submit a link to at least one photo to publish your spot."
				>
					<TextInput
						frontName=""
						backName="previewImage"
						place="Preview Image URL"
						extra={extra}
						customType="url"
					/>
					{imageSlots.map((img, idx) => (
						<input
							type="url"
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
				</FormSection>
				<button type="submit">Create Spot</button>
			</form>
		</div>
	);
}

export default NewSpotModal;
