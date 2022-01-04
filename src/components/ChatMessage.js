function ChatMessage({ auth, message }) {
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

export default ChatMessage;
