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
			<header className="App-header"></header>

			{user ? (
				<section className="main-area">
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
				console.log(`Credenciales: ${credential}....
        Codigo de Error: ${errorCode}......
        Mensaje de error: ${errorMessage}.....
        email: ${email}`);
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
				docs.forEach(async (el) => {
					await deleteDoc(doc(firestoreDb, "messages", el.id));
					console.log(`borrado id ${el.id}`);
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
		limit(25)
	);

	const [messages, loading, errorStore] = useCollectionData(q, {
		idField: "id",
	});

	useEffect(() => {
		scrollingVisibleTrick.current.scrollIntoView({ behavior: "smooth" });
	}, [messages]);
	const [isLoading, setIsLoading] = useState(false);

	const scrollingVisibleTrick = useRef();

	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!formValue) return;
		const { uid, photoURL } = auth.currentUser;

		//console.log(auth.currentUser);

		setIsLoading(true);
		await addDoc(messagesCollectionRef, {
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
		});
		setIsLoading(false);
		setFormValue("");
		scrollingVisibleTrick.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main style={{ position: "relative" }}>
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
					<input
						type="text"
						value={formValue}
						onChange={(e) => {
							setFormValue(e.target.value);
						}}
					/>
					<button type="submit">✔</button>
				</form>
			</div>
		</>
	);
}

function ChatMessage({ message }) {
	const { text, uid, photoURL } = message;

	if (auth) {
		const messageClass = auth.currentUser.uid === uid ? "sent" : "received";

		return (
			<div className={`message ${messageClass}`}>
				<img src={photoURL} alt="User" />
				<p>{text}</p>
			</div>
		);
	}
}

export default App;
