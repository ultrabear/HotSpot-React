import { useContext, useState } from "react";
import { useRef, createContext } from "react";
import "./Modal.css";
import { createPortal } from "react-dom";

/**
 * @typedef {any} ModalContent
 */

/**
 * @typedef {Object} ModalContextTy
 * @property {React.MutableRefObject<HTMLDivElement | null>} modalRef
 * @property {ModalContent} modalContent
 * @property {(_: ModalContent) => void} setModalContent
 * @property {() => void} closeModal
 * @property {(_: () => void) => void} setOnModalClose
 */

const ModalContext = createContext(/** @type {ModalContextTy} */ ({}));

/**
 * @param {import("react").PropsWithChildren<{}>} param0
 */
export function ModalProvider({ children }) {
	/** @type {React.MutableRefObject<HTMLDivElement | null>} */
	const modalRef = useRef(null);

	const [modalContent, setModalContent] = useState(null);

	const [onModalClose, setOnModalClose] = useState(
		/** @type {(() => () => void) | null} */ (null),
	);

	const closeModal = () => {
		setModalContent(null);
		if (typeof onModalClose === "function") {
			setOnModalClose(null);
			onModalClose();
		}
	};

	const contextValue = {
		modalRef,
		modalContent,
		setModalContent,
		setOnModalClose,
		closeModal,
	};

	return (
		<>
			<ModalContext.Provider value={contextValue}>
				{children}
			</ModalContext.Provider>
			<div ref={modalRef} />
		</>
	);
}

export function Modal() {
	const { modalRef, modalContent, closeModal } = useContext(ModalContext);

	if (!modalRef || !modalRef.current || !modalContent) return null;

	return createPortal(
		<div id="modal">
			<div id="modal-background" onClick={closeModal} />
			<div id="modal-content">{modalContent}</div>
		</div>,
		modalRef.current,
	);
}

export const useModal = () => useContext(ModalContext);
