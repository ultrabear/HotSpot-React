import { useState } from "react";
import { useAppDispatch, useAppSelector, useUser } from "../../store/store";
import { jsonPost } from "../../store/csrf";
import { useNavigate, useParams } from "react-router-dom";
import { getSpot } from "../../store/spots";
import { TextInput, FormSection } from "./TextInput";

/**
 * @typedef {"no" | "yes" | "checking"} CheckStatus
 */

/**
 * @param {Record<string, string | number>} details
 * @param {number} id
 * @returns {Promise<number>}
 *
 */
const editSpot = async (details, id) => {
	const res = await jsonPost(`/api/spots/${id}`, details, "PUT");

	const spot = await res.json();

	return spot.id;
};

function EditSpotPage() {
	const { spotId } = useParams();
	const dispatch = useAppDispatch();

	const id = Number(spotId);

	const [checked, setChecked] = useState(/** @type {CheckStatus}*/ ("no"));

	const spot = useAppSelector((s) => (id in s.spots ? s.spots[id] : null));

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
	});
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

		const { lat, lng, price, ...rest } = formInput;

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
		<div className="SpotForm">
			<h1>Update your Spot</h1>
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
					/>
				</FormSection>

				<button
					type="submit"
					disabled={
						Object.values(formInput).some((s) => s.length === 0) ||
						Object.keys(vErrs).length !== 0
					}
				>
					Update your Spot
				</button>
			</form>
		</div>
	);
}

export default EditSpotPage;
