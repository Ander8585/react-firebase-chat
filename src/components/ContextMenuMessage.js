import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import "./ContextMenuMessage.css";

const ContextMenuMessage = ({ contextMenuAction }) => {
	return (
		<ContextMenu id={"context-menu-message-id"} preventHideOnScroll={true}>
			<MenuItem data={{ foo: "bar1" }} onClick={contextMenuAction[0]}>
				Delete Message
			</MenuItem>
			<MenuItem data={{ foo: "bar2" }} onClick={contextMenuAction[1]}>
				Copy Message
			</MenuItem>
			{/* <MenuItem divider /> */}
		</ContextMenu>
	);
};

export default ContextMenuMessage;
