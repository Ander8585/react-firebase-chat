import "./App.css";

import { initializeApp } from "firebase/app";
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
import {
	getAuth,
	signOut,
	signInWithPopup,
	signInWithRedirect,
	GoogleAuthProvider,
} from "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import Loader from "./components/Loader";

const app = initializeApp({
	apiKey: "AIzaSyBg3sIu9AhErqy-T696JsQohreO7fBYWMU",
	authDomain: "mis-usuarios-64b43.firebaseapp.com",
	projectId: "mis-usuarios-64b43",
	storageBucket: "mis-usuarios-64b43.appspot.com",
	messagingSenderId: "218529123001",
	appId: "1:218529123001:web:1ad080bda7b82b22d66968",
	measurementId: "G-F100ZN84FM",
});

const auth = getAuth();
const firestoreDb = getFirestore();

function App() {
	const [user] = useAuthState(auth);
	return (
		<div className="App">
			{user ? (
				<section className="main-area">
					<header className="App-header">
						<h1>
							Welcome to <br /> <span style={{ color: "#00d1f7" }}>React</span>{" "}
							<span style={{ color: "#f7a212" }}>Firebase</span> Chat
						</h1>
					</header>
					<ChatRoom />
				</section>
			) : (
				<section
					className="main-area"
					style={
						!user && {
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}
					}
				>
					<SignIn />
				</section>
			)}
			<SignOut />
			{/* 	<button onClick={deleteAll}>borrar</button> */}
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		/* provider.addScope("profile");
		provider.addScope("email"); */
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				// The signed-in user info.
				const user = result.user;
				console.log(user.displayName);
				// ...
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				/* console.log(`Credenciales: ${credential}....
        Codigo de Error: ${errorCode}......
        Mensaje de error: ${errorMessage}.....
        email: ${email}`); */
				// ...
			});
	};

	return (
		<button className={"btn sign-in-btn"} onClick={signInWithGoogle}>
			Sign in with Google
		</button>
	);
}

function SignOut() {
	const signOutUser = async () => {
		//const auth = getAuth();
		const isDeleteMessage = window.confirm(
			`Si usted es el usuario Owner puede borrar toda la conversacion al salir. Desea borrar todos los mensajes al salir?`
		);
		let delaySignOut = 100;
		if (
			isDeleteMessage &&
			auth.currentUser.uid === "Mqwg0IrWTEZDJmsfLtpJ6HTqAvT2"
		) {
			delaySignOut = 4000;
			try {
				const messagesCollectionRef = collection(firestoreDb, "messages");
				const q = query(
					messagesCollectionRef,
					orderBy("createdAt", "desc"),
					limit(25)
				);
				const docs = await getDocs(q);

				const deleteAllDocs = (docs) =>
					docs.forEach(async (el) => {
						await deleteDoc(doc(firestoreDb, "messages", el.id));
						console.log(`borrado id ${el.id}`);
					});

				await deleteAllDocs(docs);
				await signOut(auth)
					.then(() => {
						// Sign-out successful.
						console.log("Sign-out successful.");
					})
					.catch((error) => {
						// An error happened.
						console.log("An error happened.");
					});
			} catch (error) {
				console.log("errores al borrar" + error);
			}
		}
		setTimeout(
			() =>
				signOut(auth)
					.then(() => {
						// Sign-out successful.
						console.log("Sign-out successful.");
					})
					.catch((error) => {
						// An error happened.
						console.log("An error happened.");
					}),
			delaySignOut
		);
	};

	return (
		auth.currentUser && (
			<button className="signout-btn btn" onClick={signOutUser}>
				Sign Out
			</button>
		)
	);
}

function ChatRoom() {
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
						.map((msg) => msg && <ChatMessage key={msg.id} message={msg} />)
						.reverse()}
				{errorStore && <ChatMessage message={errorStore} />}
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

function ChatMessage({ message }) {
	const { text, uid, photoURL, displayName } = message;

	if (auth) {
		const messageClass = auth.currentUser.uid === uid ? "sent" : "received";

		return (
			<div
				className={`message ${messageClass}`}
				onContextMenu={(e) => {
					e.preventDefault();
					alert("presionado menu contextual");
				}}
			>
				<img src={photoURL} alt="User" />
				<div className="message-text-container">
					<p className="message-owner-name">{displayName}</p>
					<p className="message-text">{text}</p>
				</div>
			</div>
		);
	}
}

export default App;
