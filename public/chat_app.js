// Connect to the WebSocket Server
var chatSocket;
var isSocketConnected = false;
var reconnectInterval = 3000; // 3 seconds

var user_name = null; // Always null on reload

// Ensure jQuery Loads First
$(document).ready(function () {
    promptUserName();  // Ask for username on every reload
    connectWebSocket();
    setupEventListeners();
});

// Function to Prompt for Username on Every Reload
function promptUserName() {
    var enter_user = prompt("Enter Your Name:");
    if (enter_user && enter_user.trim() !== "") {
        user_name = enter_user.trim();
    } else {
        alert("User Name must be provided!");
        location.reload(); // Force user to enter a valid name
    }

    $("#userName").text(user_name);
}

// Function to Connect WebSocket with Reconnection Support
function connectWebSocket() {
    chatSocket = new WebSocket("wss://app-chat-z3rs.onrender.com"); // Updated WebSocket URL

    chatSocket.onopen = () => {
        isSocketConnected = true;
        console.log("Connected to WebSocket server");

        // Send user login info to server
        send_msg({ type: "login", user: user_name });
    };

    chatSocket.onmessage = (event) => {
        var msgData = JSON.parse(event.data);
        if (!msgData || !msgData.msg) return;

        if (!msgData.user) {
            console.log(msgData.msg);
            return;
        }

        if (msgData.user !== user_name) {
            displayMessage(msgData.user, msgData.msg, "received");
        }
    };

    chatSocket.onerror = (event) => {
        console.error("WebSocket error:", event);
    };

    chatSocket.onclose = () => {
        console.warn("WebSocket disconnected! Attempting to reconnect...");
        isSocketConnected = false;
        setTimeout(connectWebSocket, reconnectInterval);
    };

    window.addEventListener("unload", () => {
        chatSocket.close();
    });
}

// Function to Send Messages
function send_msg(JSONData) {
    if (!isSocketConnected) {
        console.error("WebSocket is not connected.");
        return;
    }
    chatSocket.send(JSON.stringify(JSONData));
}

// Function to Handle Sending Messages
function triggerSend() {
    var msg = $("#msg-txt-field").val().trim();
    if (msg === "") return;

    displayMessage(user_name, msg, "sent");
    $("#msg-txt-field").val("").focus();
    send_msg({ type: "message", user: user_name, msg: msg });
}

// Function to Display Messages
function displayMessage(sender, message, type) {
    if (!$("#message-items-container").length) {
        console.error("Message container not found.");
        return;
    }

    let msgBubble = `<div class="message-item ${type}">
        <div><span class="text-muted sender-name">${sender}</span></div>
        <div class="message-content">${message.replace(/\n/g, "<br>")}</div>
    </div>`;

    $("#message-items-container").prepend(msgBubble);
}

// Function to Setup Button Click and Enter Key Events
function setupEventListeners() {
    $("#send-btn").on("click", triggerSend);
    $("#msg-txt-field").on("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            triggerSend();
        }
    });
}
