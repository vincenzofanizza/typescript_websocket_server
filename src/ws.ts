import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import Message from './db/Message';
import User from './db/User';
import ChatRoom from './db/ChatRoom';

interface ExtendedWebSocket extends WebSocket {
    userId?: number;
}

export const initializeWebSocket = async (server: Server) => {
    const wss = new WebSocketServer({ server });

    // Create or find the default chat room
    const [defaultRoom] = await ChatRoom.findOrCreate({
        where: { name: 'Default Room' },
        defaults: { name: 'Default Room' }
    });

    wss.on('connection', (ws: ExtendedWebSocket) => {
        console.log('New client connected');

        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message.toString());
                
                if (data.type === 'join') {
                    // Handle user joining
                    const user = await User.findByPk(data.userId);
                    if (user) {
                        ws.userId = user.id;
                        console.log(`User ${user.firstName} ${user.lastName} joined`);
                    }
                } else if (data.type === 'message' && ws.userId) {
                    // Handle new message
                    const newMessage = await Message.create({
                        message: data.content,
                        sentById: ws.userId,
                        chatRoomId: defaultRoom.id
                    });

                    // Broadcast message to all connected clients
                    const broadcastMessage = JSON.stringify({
                        type: 'message',
                        userId: ws.userId,
                        content: data.content,
                        timestamp: newMessage.createdAt
                    });

                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(broadcastMessage);
                        }
                    });
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    console.log('WebSocket server is running.');
}