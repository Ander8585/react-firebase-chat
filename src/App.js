import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import ChatRoom from "./components/ChatRoom";
import ChatHeader from "./components/ChatHeader";
import SignInButton from "./components/SignInButton";
import SignOutButton from "./components/SignOutButton";

initializeApp({
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
					<ChatHeader />
					<ChatRoom firestoreDb={firestoreDb} auth={auth} />
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
					<SignInButton auth={auth} />
				</section>
			)}
			<SignOutButton auth={auth} firestoreDb={firestoreDb} />
		</div>
	);
}

export default App;
