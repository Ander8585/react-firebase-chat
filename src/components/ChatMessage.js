import "./ChatMessage.css";
import { ContextMenuTrigger } from "react-contextmenu";
import React from "react";

function ChatMessage({ auth, message, messageId }) {
	const { text, uid, photoURL, displayName } = message;

	if (auth) {
		const messageClass = auth.currentUser.uid === uid ? "sent" : "received";
		//console.log(messageId);
		return (
			<div
				className={`message ${messageClass}`}
				/* onContextMenu={(e) => {
					e.preventDefault();
					alert("presionado menu contextual");
				}} */
			>
				<img src={photoURL} alt="User" />
				<div className="message-text-container">
					<p className="message-owner-name">{displayName}</p>
					<ContextMenuTrigger
						id={"context-menu-message-id"}
						renderTag={"p"}
						attributes={{
							"data-messageid": messageId,
							className: "message-text",
						}}
						children={text || ""}
					>
						{/* <p data-messageid={messageId} className="message-text">
						</p> */}
					</ContextMenuTrigger>
				</div>
			</div>
		);
	}
}

export default ChatMessage;
