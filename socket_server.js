const WebSocket = require("ws");

// Create WebSocket Server on Port 8090
const server = new WebSocket.Server({ port: 8090 });
const clients = new Map(); // Store clients and their usernames

server.on("connection", (ws) => {
    console.log("New client connected!");

    // Send welcome message
    ws.send(JSON.stringify({ type: "info", msg: "Connected to the Chat Server!" }));

    ws.on("message", (message) => {
        try {
            const msgData = JSON.parse(message);
            console.log(`Received from client:`, msgData);

            if (msgData.type === "login") {
                // Store username in clients Map
                clients.set(ws, msgData.user);
                broadcast({ type: "info", msg: `${msgData.user} has joined the chat!` }, ws);
            } else if (msgData.type === "message") {
                broadcast({ type: "message", user: clients.get(ws), msg: msgData.msg }, ws);
            }
        } catch (error) {
            console.error("Invalid JSON received:", message);
        }
    });

    ws.on("close", () => {
        const username = clients.get(ws);
        clients.delete(ws);
        if (username) {
            broadcast({ type: "info", msg: `${username} has left the chat.` });
        }
        console.log("Client disconnected.");
    });

    ws.on("error", (err) => {
        console.log("WebSocket error:", err);
    });
});

// Function to Broadcast Message to All Clients
function broadcast(data, sender = null) {
    server.clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

console.log("WebSocket server is running on ws://localhost:8090");
