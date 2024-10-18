import { useModal } from "../../context/Modal";
import "./DeleteModal.css"

/**
 * @template {any} T
 * @param {Object} param0
 * @param {() => Promise<T>} param0.deleteCallback
 * @param {string} param0.confirmText
 * @param {(v: T) => void} [param0.returns]
 */
function DeleteModal({ deleteCallback, confirmText, returns }) {
	const { closeModal } = useModal();

	const runDelete = async () => {
		const res = await deleteCallback();
		if (returns !== undefined) {
			returns(res);
		}
		closeModal();
	};

	return (
		<div className="DeleteModal Global Modal">
			<h1>Confirm Delete</h1>
			<p>Are you sure you want to {confirmText}</p>
			<div className="yes">
				<button onClick={runDelete}><h3>Yes (Delete Spot)</h3></button>
			</div>
			<div className="no">
				<button onClick={closeModal}><h3>No (Keep Spot)</h3></button>
			</div>
		</div>
	);
}

export default DeleteModal;
