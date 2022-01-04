import {
	signInWithPopup,
	/* signInWithRedirect, */
	GoogleAuthProvider,
} from "firebase/auth";

function SignInButton({ auth }) {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		/* provider.addScope("profile");
		provider.addScope("email"); */
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				//const credential = GoogleAuthProvider.credentialFromResult(result);
				//const token = credential.accessToken;
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

export default SignInButton;
