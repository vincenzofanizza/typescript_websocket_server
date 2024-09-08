import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Message from './db/Messages';

// Create an HTTP server
const server = createServer();
const port = 8080;

// Create a WebSocket server instance
const wss = new WebSocketServer({ server });

// Listen for connection events
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  // Listen for incoming messages from the client
  ws.on('message', async (message: string) => {
    console.log(`Received message: ${message}`);

    // Save the message to the database using Sequelize
    await Message.create({ message });

    // Send a message back to the client
    ws.send(`Server received and saved your message: ${message}`);
  });

  // Listen for the client disconnecting
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the HTTP server
server.listen(port, () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
