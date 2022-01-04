import { useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import ChatMessage from "./ChatMessage";
import Loader from "./Loader";
import {
	getFirestore,
	addDoc,
	collection,
	query,
	orderBy,
	limit,
	serverTimestamp,
	getDocs,
	doc,
	deleteDoc,
} from "firebase/firestore";

function ChatRoom({ firestoreDb, auth }) {
	const messagesCollectionRef = collection(firestoreDb, "messages");

	const q = query(
		messagesCollectionRef,
		orderBy("createdAt", "desc"),
		limit(50)
	);

	const [messages, loading, errorStore] = useCollectionData(q, {
		idField: "id",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [textareaRowsNumber, setTextareaRowsNumber] = useState(1);
	const [formValue, setFormValue] = useState("");

	const scrollingVisibleTrick = useRef();
	const textAreaRef = useRef();

	useEffect(() => {
		scrollingVisibleTrick.current.scrollIntoView({
			block: "end",
			behavior: "smooth",
		});
	}, [messages]);

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!formValue.trim()) return;
		const { uid, photoURL, displayName } = auth.currentUser;

		console.log(auth.currentUser);

		setIsLoading(true);
		await addDoc(messagesCollectionRef, {
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
			displayName,
		});
		setIsLoading(false);
		setFormValue("");
		setTextareaRowsNumber(1);
		//scrollingVisibleTrick.current.scrollIntoView({ behavior: "smooth" });
	};

	const changeTextArea = (e) => {
		const maxCharsInOneLine = 36; //maximun in one line
		const linesArray = e.target.value.split("\n");
		let charLines = 0;

		linesArray.forEach((el) => {
			if (el.length > maxCharsInOneLine) {
				charLines += el.length / (maxCharsInOneLine + 1);
			}
		});
		charLines += linesArray.length;
		setFormValue(e.target.value);
		setTextareaRowsNumber(charLines <= 3 ? charLines : 3);
	};

	const keyDownTextArea = (e) => {
		if ((e.key === " " || e.key === "Enter") && e.target.value.trim() === "") {
			e.preventDefault();
			return;
		}
		if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
	};

	return (
		<>
			<main style={{ position: "relative", top: "15vh" }}>
				{messages &&
					messages
						.map(
							(msg) =>
								msg && <ChatMessage auth={auth} key={msg.id} message={msg} />
						)
						.reverse()}
				{errorStore && <ChatMessage auth={auth} message={errorStore} />}
				<div
					ref={scrollingVisibleTrick}
					className="scrolling-visible-div"
				></div>
				{isLoading && (
					<div className="loader">
						<Loader />
					</div>
				)}
			</main>
			<div className="write-area-container">
				<form onSubmit={sendMessage} className="input-area">
					<textarea
						type="text"
						value={formValue}
						onChange={changeTextArea}
						onKeyDown={keyDownTextArea}
						rows={textareaRowsNumber}
						ref={textAreaRef}
					/>

					<button type="submit">
						<svg
							aria-hidden="true"
							focusable="false"
							data-prefix="fas"
							data-icon="paper-plane"
							class="svg-inline--fa fa-paper-plane fa-w-16"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
						>
							<path
								fill="currentColor"
								d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"
							/>
						</svg>
					</button>
				</form>
			</div>
		</>
	);
}

export default ChatRoom;
