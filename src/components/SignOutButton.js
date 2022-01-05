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
		const isDeleteMessage = () =>
			window.confirm(
				`Usted tiene todos los privilegios.\n Puede borrar toda la conversacion al salir.\n Presione "OK" para borrar o "Cancel" para mantenerla`
			);
		let delaySignOut = 10;
		if (auth.currentUser.uid === "Mqwg0IrWTEZDJmsfLtpJ6HTqAvT2")
			if (isDeleteMessage()) {
				//delaySignOut = 4000;
				try {
					const messagesCollectionRef = collection(firestoreDb, "messages");
					const q = query(
						messagesCollectionRef,
						orderBy("createdAt", "desc"),
						limit(50)
					);
					const docs = await getDocs(q);
					delaySignOut = (1000 * docs.docs.length) / 5;

					const deleteAllDocs = (docs) =>
						docs.forEach(async (el) => {
							await deleteDoc(doc(firestoreDb, "messages", el.id));
							//console.log(`borrado id ${el.id}`);
						});

					await deleteAllDocs(docs);
				} catch (error) {
					console.log("errores al borrar" + error);
				}
			}
		if (
			window.confirm(
				`Desea cerrar el React-Firebase-chat?\n Presione "OK" para confirmar`
			)
		) {
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
		}
		


		
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
