import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector, useUser } from "../../store/store";
import { csrfFetch } from "../../store/csrf";
import { useNavigate } from "react-router-dom";

/**
 * @param {Object} param0
 * @param {string} param0.frontName
 * @param {string} param0.backName
 * @param {string} [param0.place]
* @param {Object} param0.extra
* @param {Record<string, string>} param0.extra.formInput
 * @param {(e: any, pretty: string) => void} param0.extra.handleChange
 * @param {Record<string, string>} param0.extra.vErrs
 
 */
function TextInput({ frontName, backName, place, extra }) {
	if (place === undefined) {
		place = frontName;
	}

	const pretty = frontName.length ? frontName : backName;

	return (
		<>
			{frontName}
			<input
				type="text"
				name={backName}
				value={extra.formInput[backName]}
				placeholder={place}
				onChange={(e) => extra.handleChange(e, pretty)}
			/>
			<span className="errors">
				{extra.vErrs[backName] ? extra.vErrs[backName] : false}
			</span>
		</>
	);
}

/**
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<Response>}
 */
async function jsonPost(url, body) {
	return csrfFetch(url, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	});
}

/**
 * @param {Record<string, string | number>} details
 * @param {string[]} imgUrls
 * @returns {Promise<number>}
 *
 */
const createSpot = async (details, imgUrls) => {
	try {
		const res = await jsonPost("/api/spots", details);

		const spot = await res.json();

		const images = imgUrls.map((url, idx) =>
			jsonPost(`/api/spots/${spot.id}/images`, { url, preview: idx === 0 }),
		);

		await Promise.all(images);

		return spot.id;
	} catch (e) {
		throw e
	}
};

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
	const [escape, setEscape] = useState(/** @type {false | number} */(false));
	const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
	const [vErrs, setVErrs] = useState(
		/** @type {{
		 country?: string,
		 address?: string,
		 city?: string,
		 state?: string,
		 lat?: string,
		 lng?: string,
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

	const numcheck = (v) => (isNaN(Number(v)) ? "(a number)" : true);

	/**
	 * @type {Record<string, (v: string) => true | string>}
	 */
	const validators = {
		description: (v) => (v.length >= 30 ? true : "at least 30 characters"),
		price: numcheck,
		lat: numcheck,
		lng: numcheck,
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

		handleChangeInner(name, val, pretty);
	};

	/**
	 * @param {string} name
	 * @param {string} val
	 * @param {string} pretty
	 * */
	const handleChangeInner = (name, val, pretty) => {
		setFormInput({
			...formInput,
			[name]: val,
		});

		const vname = name in validators ? validators[name](val) : true;

		const fmt = vname !== true ? ` ${vname}` : "";

		if (val.length === 0 || vname !== true) {
			setVErrs({ ...vErrs, [name]: `Please set a valid ${pretty}${fmt}` });
		} else {
			const rest = { ...vErrs };
			//@ts-ignore
			delete rest[name];
			setVErrs(rest);
		}
	};

	/**
	 * @param {React.FormEvent<HTMLFormElement>} e
	 */
	const handleSubmit = (e) => {
		e.preventDefault();

		const { lat, lng, price, previewImage, ...rest } = formInput;

		createSpot(
			{ lat: Number(lat), lng: Number(lng), price: Number(price), ...rest },
			[previewImage, ...imageSlots.filter((s) => s.length)],
		).then(setEscape).catch(async e => {

				setErrors((await e.json()).errors);
				
		});
	};

	const extra = { formInput, handleChange, vErrs };

	if (escape !== false) {
		nav(`/spots/${escape}`);
	}


	return (
		<>
			<h1>Create a new Spot</h1>
			<ul className="errors">{Object.entries(errors).map(([k, v]) => <h3 key={k}>{v}</h3>)}</ul>
			<form onSubmit={handleSubmit}>
				<h2>Where's your place located?</h2>
				<p>
					Guests will only get your exact address once they booked a
					reservation.
				</p>
				<TextInput frontName="Country" backName="country" extra={extra} />
				<TextInput
					frontName="Street Address"
					backName="address"
					place="Address"
					extra={extra}
				/>
				<TextInput frontName="City" backName="city" extra={extra} />
				<TextInput frontName="State" backName="state" extra={extra} />
				<TextInput frontName="Latitude" backName="lat" extra={extra} />
				<TextInput frontName="Longitude" backName="lng" extra={extra} />
				<h2>Describe your place to guests</h2>
				<p>
					Mention the best features of your space, any special amenities like
					fast wifi or parking, and what you love about the neighborhood
				</p>
				<textarea
					name="description"
					value={formInput["description"]}
					placeholder="Please write at least 30 characters"
					onChange={(e) => handleChange(e, "description")}
				/>
				<span className="errors">
					{extra.vErrs["description"] ? extra.vErrs["description"] : false}
				</span>
				<h2>Create a title for your spot</h2>
				<p>
					Catch guests' attention with a spot title that highlights what makes
					your place special
				</p>
				<TextInput
					frontName=""
					backName="name"
					place="Name of your spot"
					extra={extra}
				/>
				<h2>Set a base price for your spot</h2>
				<p>
					Competitive pricing can help your listing stand out and rank higher in
					search results
				</p>
				$
				<TextInput
					frontName=""
					backName="price"
					place="Price per night (USD)"
					extra={extra}
				/>
				<h2>Liven up your spot with photos</h2>
				<p>Submit a link to at least one photo to publish your spot</p>
				<TextInput
					frontName=""
					backName="previewImage"
					place="Preview Image URL"
					extra={extra}
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
				<button
					type="submit"
					disabled={
						Object.values(formInput).some((s) => s.length === 0) ||
						Object.keys(vErrs).length !== 0
					}
				>
					Create Spot
				</button>
			</form>
		</>
	);
}

export default NewSpotModal;
