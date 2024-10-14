import { useModal } from "../../context/Modal";

/**
 * @typedef {Object} OpenModalButtonTy
 * @property {any} modalComponent
 * @property {string} buttonText
 * @property {(() => void)} [onButtonClick]
 * @property {(() => void)} [onModalClose]
 *
 */

/**
 * @param {React.PropsWithRef<OpenModalButtonTy>} param0
 */
function OpenModalButton({
	modalComponent,
	buttonText,
	onButtonClick,
	onModalClose,
}) {
	const { setModalContent, setOnModalClose } = useModal();

	const onClick = () => {
		if (onModalClose) setOnModalClose(onModalClose);
		setModalContent(modalComponent);
		if (typeof onButtonClick === "function") onButtonClick();
	};

	return <button onClick={onClick}>{buttonText}</button>;
}

export default OpenModalButton;
