import "./TextInput.css";

export function TextInput({
	frontName,
	backName,
	place,
	extra,
	customType,
}: {
	frontName: string;
	backName: string;
	customType?: string;
	place?: string;
	extra: {
		formInput: Record<string, string>;
		handleChange: (e: any, pretty: string) => void;
		vErrs: Record<string, string>;
	};
}) {
	if (place === undefined) {
		place = frontName;
	}

	const pretty = frontName.length ? frontName : backName;

	return (
		<>
			<label>
				{frontName}
				<input
					type={customType ? customType : "text"}
					name={backName}
					value={extra.formInput[backName]}
					placeholder={place}
					onChange={(e) => extra.handleChange(e, pretty)}
				/>

				<span className="Global errors">
					{extra.vErrs[backName] ? extra.vErrs[backName] : false}
				</span>
			</label>
		</>
	);
}

interface SectionProps {
	index: number;
	heading: string;
	caption: string;
}

export function FormSection({
	index,
	heading,
	caption,
	children,
}: React.PropsWithChildren & SectionProps) {
	return (
		<div data-testid={`section-${index}`} className="FormSection">
			<h2 data-testid={`section-${index}-heading`}>{heading}</h2>
			<p data-testid={`section-${index}-caption`}>{caption}</p>
			{children}
		</div>
	);
}
