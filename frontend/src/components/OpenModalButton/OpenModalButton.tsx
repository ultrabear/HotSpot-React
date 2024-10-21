import { useModal } from "../../context/Modal";

interface OpenModalButtonTy {
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalComponent: any;
    buttonText: string;
    onButtonClick?: (() => void);
    onModalClose?: (() => void);
}

function OpenModalButton({
	modalComponent,
	buttonText,
	onButtonClick,
	onModalClose,
}: React.PropsWithRef<OpenModalButtonTy>) {
	const { setModalContent, setOnModalClose } = useModal();

	const onClick = () => {
		if (onModalClose) setOnModalClose(onModalClose);
		setModalContent(modalComponent);
		if (typeof onButtonClick === "function") onButtonClick();
	};

	return <button onClick={onClick}>{buttonText}</button>;
}

export default OpenModalButton;
