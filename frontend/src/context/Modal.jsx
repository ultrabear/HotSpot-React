import { useContext, useState } from "react";
import { useRef, createContext } from "react";
import "./Modal.css";
import { createPortal } from "react-dom";

/**
 * @typedef {any} ModalContent
 */

/**
 * @typedef {Object} ModalContextTy
 * @property {React.MutableRefObject<any>} modalRef
 * @property {ModalContent} modalContent
 * @property {(_: ModalContent) => void} setModalContent
 * @property {() => void} closeModal
 * @property {(_: () => void) => void} setOnModalClose
 */

const ModalContext = createContext(/** @type {ModalContextTy} */ ({}));

export function ModalProvider({ children }) {
	const modalRef = useRef();

	const [modalContent, setModalContent] = useState(null);

	const [onModalClose, setOnModalClose] = useState(null);

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
