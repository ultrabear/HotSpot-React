import { useContext, useState } from "react";
import { useRef, createContext } from "react";
import "./Modal.css";
import { createPortal } from "react-dom";

//eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModalContent = any;

interface ModalContextTy {
	modalRef: React.MutableRefObject<HTMLDivElement | null>;
	modalContent: ModalContent;
	setModalContent: (_: ModalContent) => void;
	closeModal: () => void;
	setOnModalClose: (_: () => void) => void;
}

const ModalContext = createContext({} as ModalContextTy);

/**
 * @param {import("react").PropsWithChildren<{}>} param0
 */
export function ModalProvider<T>({
	children,
}: import("react").PropsWithChildren<T>) {
	/** @type {React.MutableRefObject<HTMLDivElement | null>} */
	const modalRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

	const [modalContent, setModalContent] = useState(null);

	const [onModalClose, setOnModalClose] = useState(
		null as (() => () => void) | null,
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
