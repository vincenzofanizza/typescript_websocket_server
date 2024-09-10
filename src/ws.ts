import WebSocket, { WebSocketServer } from 'ws';
import Message from './db/Message';
import { Server } from 'http';

export const initializeWebSocket = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('New client connected');

        // Send an array containing all the existing messages to client upon connection
        Message.findAll().then((messages) => {
            const formattedMessages = messages.map((message) => message.message).join('\n');
            console.log(`Sending existing messages to client:\n${formattedMessages}`);
            ws.send(formattedMessages);
        });

        ws.on('message', async (message: string) => {
            console.log(`Received message: ${message}`);
            const newMessage = await Message.create({ message });

            console.log(`Broadcasting new message to all clients: ${newMessage.message}`);
            wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                console.log(`Sending new message to client: ${newMessage.message}`);
                client.send(newMessage.message);
            }
            });
        
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    console.log('WebSocket server is running.');
}