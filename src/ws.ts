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
                    const user = await User.findByPk(data.userId);
                    if (user) {
                        ws.userId = user.id;
                        console.log(`User ${user.id} joined`);
                    }
                } else if (data.type === 'message') {
                    if (!ws.userId) {
                        // Error if userId is not set
                        ws.send(JSON.stringify({ type: 'error', message: 'You must join the chat first.' }));
                        return;
                    }

                    const newMessage = await Message.create({
                        message: data.content,
                        sentById: ws.userId,
                        chatRoomId: defaultRoom.id
                    });

                    console.log(`User ${ws.userId} sent a message: ${data.content}`);

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
                } else {
                    // Error for unsupported message types
                    ws.send(JSON.stringify({ type: 'error', message: 'Unsupported message type.' }));
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
            }
        });

        ws.on('close', () => {
            if (ws.userId) {
                console.log(`User ${ws.userId} left the chatroom`);
            } else {
                console.log('Client disconnected');
            }
        });
    });

    console.log('WebSocket server is running.');
}