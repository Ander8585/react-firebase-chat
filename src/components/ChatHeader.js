import React from "react";
import "./ChatHeader.css";

const ChatHeader = () => {
	return (
		<header className="App-header">
			<h1>
				Welcome to <br /> <span style={{ color: "#00d1f7" }}>React</span>{" "}
				<span style={{ color: "#f7a212" }}>Firebase</span> Chat
			</h1>
		</header>
	);
};

export default ChatHeader;
