import "./SignOutButton.css";
import {
	collection,
	query,
	orderBy,
	limit,
	getDocs,
	doc,
	deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

function SignOutButton({ auth, firestoreDb }) {
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

export default SignOutButton;
