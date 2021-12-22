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
	deleteDoc,
	doc,
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
import { useRef, useState } from "react";

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

	const deleteAll = () => {
		//const messagesRef = collection(firestoreDb, "messages");
		const messagesRef = doc(firestoreDb, "messages");
		deleteDoc(messagesRef)
			.then((res) => {
				console.log("borrado correctamente");
				console.log(res);
			})
			.catch((error) => console.log(error.errorMessage));
	};
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
			<button onClick={deleteAll}>borrar</button>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		/* provider.addScope("profile");
		provider.addScope("email"); */
		console.log(`proveedor: ${provider}`);
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				// The signed-in user info.
				const user = result.user;
				console.log(`Credenciales: ${credential.keys}.... 
                   Token: ${token}......
                   usuario: ${user.keys}.....`);
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
	const signOutUser = () => {
		const auth = getAuth();
		signOut(auth)
			.then(() => {
				// Sign-out successful.
				console.log("Sign-out successful.");
			})
			.catch((error) => {
				// An error happened.
				console.log("An error happened.");
			});
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
	const messagesRef = collection(firestoreDb, "messages");

	const q = query(messagesRef, orderBy("createdAt", "desc"), limit(25));

	const [messages, loading, errorStore] = useCollectionData(q, {
		idField: "id",
	});

	const scrollingVisibleTrick = useRef();

	const [formValue, setFormValue] = useState("");
	console.log(messages);
	console.log(errorStore);

	const sendMessage = async (e) => {
		e.preventDefault();
		const { uid, photoURL } = auth.currentUser;

		console.log(auth.currentUser);

		await addDoc(messagesRef, {
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
		});
		setFormValue("");
		scrollingVisibleTrick.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main>
				{messages &&
					messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
				{errorStore && <ChatMessage message={errorStore} />}
				<div
					ref={scrollingVisibleTrick}
					className="scrolling-visible-div"
				></div>
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

	const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt="User" />
			<p>{text}</p>
		</div>
	);
}

export default App;
