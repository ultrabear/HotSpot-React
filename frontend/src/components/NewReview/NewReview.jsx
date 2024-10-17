import { useModal } from "../../context/Modal"

function NewReview() {


	const { closeModal } = useModal();


	return (<>
		<form className="NewReview">
			How was your stay?
			<textarea placeholder="Leave your review here..."/>
			<input type="number" min="1" max="5" /> Stars
			<button type="submit">Submit Your Review</button>
		</form>



	</>)


}



export default NewReview
