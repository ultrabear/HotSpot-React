import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector, useUser } from "../../store/store";
import { csrfFetch, jsonPost } from "../../store/csrf";
import { useNavigate, useParams } from "react-router-dom";
import { getSpot } from "../../store/spots";

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
			<span className="Global errors">
				{extra.vErrs[backName] ? extra.vErrs[backName] : false}
			</span>
		</>
	);
}

/**
 * @typedef {"no" | "yes" | "checking"} CheckStatus
 */

/**
 * @param {CheckStatus} checked
 * @returns {boolean}
 */
function checking(checked) {
	return checked === "no" || checked === "checking";
}

/**
 * @param {Record<string, string | number>} details
 * @param {number} id
 * @returns {Promise<number>}
 *
 */
const editSpot = async (details, id) => {
	try {
		const res = await jsonPost(`/api/spots/${id}`, details, "PUT");

		const spot = await res.json();

		return spot.id;
	} catch (e) {
		throw e;
	}
};

function EditSpotPage() {
	const { spotId } = useParams();
	const dispatch = useAppDispatch();

	const id = Number(spotId);

	const [checked, setChecked] = useState(/** @type {CheckStatus}*/ ("no"));
	const [checkReview, setCheckReview] = useState(
		/** @type {CheckStatus}*/ ("no"),
	);

	const spot = useAppSelector((s) => (id in s.spots ? s.spots[id] : null));

	const reviews = useAppSelector((s) =>
		[...(s.reviews.map[id] ?? [])].map((id) => s.reviews.all[id]),
	);

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
		 lat?: string,
		 lng?: string,
		 description?: string,
		 name?: string,
		 price?: string,
		 previewImage?: string,
		}} */ ({}),
	);
	const nav = useNavigate();

	if (checked === "no") {
		setChecked("checking");
		(async () => {
			try {
				const details = await dispatch(getSpot(id));

				setFormInput({
					country: details.country,
					address: details.address,
					city: details.city,
					state: details.state,
					lat: String(details.lat),
					lng: String(details.lng),
					description: details.description,
					name: details.name,
					price: String(details.price),
					previewImage:
						details.SpotImages.find((img) => img.preview)?.url ?? "",
				});
			} finally {
				setChecked("yes");
			}
		})();
	}

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

		editSpot(
			{ lat: Number(lat), lng: Number(lng), price: Number(price), ...rest },
			Number(spot?.id),
		)
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
		<>
			<h1>Update your Spot</h1>
			<ul className="Global errors">
				{Object.entries(errors).map(([k, v]) => (
					<h3 key={k}>{v}</h3>
				))}
			</ul>
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
				<span className="Global errors">
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

export default EditSpotPage;
