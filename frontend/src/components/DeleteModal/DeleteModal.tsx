import { useModal } from "../../context/useModal";
import "./DeleteModal.css";

/**
 * @template {any} T
 * @param {Object} param0
 * @param {() => Promise<T>} param0.deleteCallback
 * @param {string} param0.confirmText
 * @param {string} param0.buttonType
 * @param {string} param0.internal
 * @param {(v: T) => void} [param0.returns]
 */
function DeleteModal<T>({
	deleteCallback,
	confirmText,
	buttonType,
	returns,
	internal,
}: { deleteCallback: () => Promise<T>; confirmText: string; buttonType: string; internal: string; returns?: (v: T) => void; }) {
	const { closeModal } = useModal();

	const runDelete = async () => {
		const res = await deleteCallback();
		if (returns !== undefined) {
			returns(res);
		}
		closeModal();
	};

	return (
		<div className="DeleteModal Global Modal" data-testid={`delete-${internal}-modal`}>
			<h1>Confirm Delete</h1>
			<p>Are you sure you want to {confirmText}</p>
			<div>
			<div className="yes">
				<button
					onClick={runDelete}
					data-testid={`confirm-delete-${internal}-button`}
				>
					<h3>Yes (Delete {buttonType})</h3>
				</button>
			</div>
			<div className="no">
				<button
					onClick={closeModal}
					data-testid={`cancel-delete-${internal}-button`}
				>
					<h3>No (Keep {buttonType})</h3>
				</button>
			</div>
			</div>
		</div>
	);
}

export default DeleteModal;
