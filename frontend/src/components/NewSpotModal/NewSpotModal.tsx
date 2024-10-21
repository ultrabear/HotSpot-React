import { useState } from "react";
import { useUser } from "../../store/store";
import { jsonPost } from "../../store/csrf";
import { useNavigate } from "react-router-dom";
import { TextInput, FormSection } from "./TextInput";

import "./SpotForm.css";

async function createSpot(
	details: Record<string, string | number>,
	imgUrls: string[],
): Promise<number> {
	const res = await jsonPost("/api/spots", details);

	const spot = await res.json();

	const images = imgUrls.map((url, idx) =>
		jsonPost(`/api/spots/${spot.id}/images`, { url, preview: idx === 0 }),
	);

	await Promise.all(images);

	return spot.id;
}

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
	const [escape, setEscape] = useState(false as false | number);
	const [errors, setErrors] = useState({} as Record<string, string>);
	const [vErrs, setVErrs] = useState(
		{} as {
			country?: string;
			address?: string;
			city?: string;
			state?: string;
			description?: string;
			name?: string;
			price?: string;
			previewImage?: string;
		},
	);
	const nav = useNavigate();

	const numcheck = (v: unknown): true | string =>
		isNaN(Number(v)) ? "Price per night is required" : true;

	const validators: Record<string, (v: string) => true | string> = {
		description: (v) =>
			v.length >= 30 ? true : "Description needs 30 or more characters",
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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		pretty: string,
	) => {
		const val = e.target.value;
		const name = e.target.name;

		setVErrs(handleChangeInner(name, val, pretty, vErrs));
	};

	const handleChangeInner = (
		name: string,
		val: string,
		pretty: string,
		vErrs: Record<string, string>,
	) => {
		setFormInput({
			...formInput,
			[name]: val,
		});

		const vname = name in validators ? validators[name](val) : true;

		const fmt = vname !== true ? ` ${vname}` : "";

		let last = fmt.length ? fmt : `${pretty} is required`;

		if (name in snowFlakes) {
			//@ts-expect-error im lazy
			last = snowFlakes[name];
		}

		if (val.length === 0 || vname !== true) {
			return { ...vErrs, [name]: last };
		} else {
			const rest = { ...vErrs };
			delete rest[name];
			return rest;
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formsData = {
			country: "Country",
			address: "Address",
			city: "City",
			state: "State",
			description: "Description",
			name: "Name",
			price: "Price",
			previewImage: "Preview Image",
		};

		const forms = Object.entries(formsData);

		let errs = {};

		for (const data of forms) {
			const [name, pretty] = data;

			//@ts-expect-error Object.entries mangles the typeinfo, maybe fix?
			errs = handleChangeInner(name, (formInput[name] as string), pretty, errs);
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
