$(document).ready(function() {
	var userID = storeUser();
	// Event handlers
	$('.chat-submit').on("click", function(e) {
		handleChatSubmit(e);
	});

	$('.chat-list').on("click", ".delete-msg", function(e) {
		var msgID = $(this).attr('data-msg-id');
		deleteMsg(msgID);
	});

	$('.chat-list').on("click", ".msg-text", function(e) {
		if($(this).attr("data-user-id") == userID) {
			$(this).select();
		}
	});

	$('.chat-list').on("change", ".msg-text", function(e) {
		var pos = $(this).attr('data-msg-id');
		var val = $(this).val();
		editMsg(pos, val)
	});

	$('.users-list').on("click", ".user-text", function(e) {
		if($(this).attr("data-user-id") == userID) {
			$(this).select();
		}
	});

	$('.users-list').on("change", ".user-text", function(e) {
		var pos = $(this).attr('data-user-id');
		var val = $(this).val();
		editUserName(pos, val)
	});

	window.addEventListener('storage', handleStoreageUpdate, false);

	window.addEventListener("unload", function (e) {
		disableUser();
		return null;
	});

	// Handle updates to storage
	function handleStoreageUpdate(e) {
		var key = e.key;
		handleMsgUpdate();
		handleUsersUpdate();
	}

	function handleMsgUpdate() {
		$('.chat-list').empty();
		displayAllStoredMsg();
	}

	function handleUsersUpdate() {
		$('.users-list').empty();
		displayAllActiveUsers();
	}

	// Capture chat submission
	function handleChatSubmit(e) {
		e.preventDefault();
		var msg = getChatVal();
		if(msg.length > 0) {
			var storedMsg = storeMsg(msg, userID);
			displayMessage(formatMsgForDisp(storedMsg), storedMsg.msgID);
		}
	}

	function getChatVal() {
		return $('.chat-text').val();
	}

	// Message formatting and display
	function formatMsgForDisp(obj) {
		var deleteX;
		var readOnly;
		if(obj.userID === userID) {
			deleteX = '<span class="delete-msg" data-msg-id="'+ obj.msgID + '">X </span>';
			readOnly = "";
		} else {
			deleteX = "";
			readOnly = "readonly";
		}
		var msgStr = '<li class="chat-msg" data-msg-id="'
			+ obj.msgID
			+ '">'
			+ deleteX
			+ '<span class="user-name">'
			+ getAllUsers()[obj.userID].name
			+ '</span> - '
			+ '<input type="text" class="msg-text" data-msg-id="'
			+ obj.msgID
			+ '" '
			+ 'data-user-id="'
			+ obj.userID
			+ '" value="'
			+ obj.msg
			+ '"'
			+ readOnly
			+ '>';
		return msgStr;
	}

	function displayMessage(msg) {
		if(msg !== null) {
			var length = $('.chat-list li').length;
			if(msg.msgId < length) {
				$('.chat-list li:eq(' + msg.msgId + ')').replaceWith(msg);
			} else {
				$('.chat-list').append(msg);
			}
		}
	}

	function displayAllStoredMsg() {
		getAllMessages().forEach(function(msg) {
			if(msg != null) {
				displayMessage(formatMsgForDisp(msg));				
			}
		});
	};

	// Users formatting and display
	function formatUserForDisp(obj) {
		var readOnly = obj.id === userID ? "" : "readonly";
		var userStr = '<li class="user-name" data-user-id="'
			+ obj.id
			+ '"><input class="user-text" value="'
			+ obj.name
			+ '" data-user-id="'
			+ obj.id
			+ '" '
			+ readOnly
			+'></input></li>';
		return userStr;
	}

	function displayUser(user) {
		if(user !== null) {
			var length = $('.users-list li').length;
			if(user.id < length) {
				$('.users-list li:eq(' + user.id + ')').replaceWith(user);
			} else {
				$('.users-list').append(user);
			}
		}
	}

	function displayAllActiveUsers() {
		getAllUsers().forEach(function(user) {
			if(user != null && user.active) {
				displayUser(formatUserForDisp(user));				
			}
		});
	};

	// Handle existing message deletes and edits
	function deleteMsg(msgID) {
		var index = getMsgIndexByID(msgID)
		updateMsg(index, null);
	}

	function editMsg(msgID, newMsg) {
		var index = getMsgIndexByID(msgID);
		var editedMsg = getAllMessages()[index];
		editedMsg.msg = newMsg;
		updateMsg(index, editedMsg);
	}

	function getMsgIndexByID(id) {
		var index = getAllMessages().findIndex(function(e) {
			if(e != null && e.userID === userID) {
				return e.msgID == id;
			}
		});
		return index;
	}

	function updateMsg(arrayPos, updateVal) {
		allMessages = getAllMessages();
		allMessages[arrayPos] = updateVal;
		localStorage.setItem("messages", JSON.stringify(allMessages));
		$('.chat-list').empty();
		displayAllStoredMsg();
	}


	// Handle existing users deletes and edits
	function disableUser() {
		var storedUsers = getAllUsers();
		var ind = storedUsers.findIndex(function(e) {
			if(e != null && e.id == userID) {
				return true;
			}
		});
		var editedUser = storedUsers[ind];
		editedUser.active = false;
		updateUser(userID, editedUser);
	}

	function editUserName(userID, newName) {
		var storedUsers = getAllUsers();
		var ind = storedUsers.findIndex(function(e) {
			if(e != null && e.id == userID) {
				return true;
			}
		});
		var editedUser = storedUsers[ind];
		editedUser.name = newName;
		updateUser(ind, editedUser);
	}

	function updateUser(arrayPos, updateVal) {
		allUsers = getAllUsers();
		allUsers[arrayPos] = updateVal;
		localStorage.setItem("users", JSON.stringify(allUsers));
		handleMsgUpdate();
	}

	displayAllStoredMsg();
	displayAllActiveUsers();
});

// Verify client supports local storage
function localStorageSupported() {
	try {
		return "localStorage" in window && window["localStorage"] !== null;
	} catch (e) {
		return false;
	}
}

// Add, update and retrieve user information from storage
function storeUser() {
	if(localStorageSupported) {
		var users = getAllUsers();
		var length = users ? users.length : 0;
		var userInfo = {
			name:    "guest_" + length,
			id:      length,
			active:  true
		}
		if(users) {
			users.push(userInfo);
			localStorage.setItem("users", JSON.stringify(users));
		} else {
			localStorage.setItem("users", JSON.stringify([userInfo]));
		}
		return length++;
	}
}

function getAllUsers() {
	return JSON.parse(localStorage.getItem("users"));
}

// Add, update and retrieve messages from local storage
function storeMsg(msg, userID) {
	var msgs = JSON.parse(localStorage.getItem("messages"));
	var timestamp = Date.now();
	var msgContent = {
		msg:        msg,
		timestamp:  timestamp,
		userID:     userID
	}
	if(msgs) {
		msgContent.msgID = msgs.length;
		msgs.push(msgContent);
		localStorage.setItem("messages", JSON.stringify(msgs));
	} else {
		msgContent.msgID = 0;
		localStorage.setItem("messages", JSON.stringify([msgContent]));
	}
	return msgContent;
}

function getAllMessages() {
	return JSON.parse(localStorage.getItem("messages")) || [];
}