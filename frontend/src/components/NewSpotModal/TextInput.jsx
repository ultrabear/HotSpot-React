
import "./TextInput.css"

/**
 * @param {Object} param0
 * @param {string} param0.frontName
 * @param {string} param0.backName
 * @param {string} [param0.customType]
 * @param {string} [param0.place]
* @param {Object} param0.extra
* @param {Record<string, string>} param0.extra.formInput
 * @param {(e: any, pretty: string) => void} param0.extra.handleChange
 * @param {Record<string, string>} param0.extra.vErrs
 
 */
export function TextInput({ frontName, backName, place, extra, customType }) {
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

/**
 * @typedef {object} SectionProps
 * @prop {number} index
 * @prop {string} heading
 * @prop {string} caption
 */

/**
 * @param {React.PropsWithChildren & SectionProps} param0
 */
export function FormSection({ index, heading, caption, children }) {
	return (
		<div data-testid={`section-${index}`} className="FormSection">
			<h2 data-testid={`section-${index}-heading`}>{heading}</h2>
			<p data-testid={`section-${index}-caption`}>{caption}</p>
			{children}
		</div>
	);
}

