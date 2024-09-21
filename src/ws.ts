import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import Message from './db/Message';
import User from './db/User';
import ChatRoom from './db/ChatRoom';
import supabase from './auth/supabaseClient';
import { IncomingMessage } from 'http';

interface ExtendedWebSocket extends WebSocket {
    userId?: string;
    chatRoomId?: string;
}

export const initializeWebSocket = async (server: Server) => {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', async (request: IncomingMessage, socket, head) => {
        const token = request.headers['sec-websocket-protocol'] as string

        if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
            return
        }

        try {
            const { data, error } = await supabase.auth.getUser(token)
            if (error || !data.user) throw error

            wss.handleUpgrade(request, socket, head, (ws: ExtendedWebSocket) => {
                ws.userId = data.user.id
                wss.emit('connection', ws, request)
            })
        } catch (error) {
            console.error('WebSocket authentication error:', error)
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
        }
    })

    wss.on('connection', (ws: ExtendedWebSocket) => {
        console.log(`User ${ws.userId} connected`)

        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message.toString());

                switch (data.type) {
                    case 'join':
                        await handleJoin(ws, data);
                        break;
                    case 'message':
                        await handleMessage(ws, data, wss);
                        break;
                    case 'switchRoom':
                        await handleSwitchRoom(ws, data);
                        break;
                    default:
                        ws.send(JSON.stringify({ type: 'error', message: 'Unsupported message type.' }));
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
            }
        });

        ws.on('close', () => {
            if (ws.userId) {
                console.log(`User ${ws.userId} left the chatroom ${ws.chatRoomId}`);
            } else {
                console.log('Client disconnected');
            }
        });
    });

    console.log('WebSocket server is running on ws://localhost:8080');
}
async function fetchRecentMessages(chatRoomId: string) {
    const recentMessages = await Message.findAll({
        where: { chatRoomId: chatRoomId },
        order: [['createdAt', 'DESC']],
        limit: 50
    });
    return recentMessages;
}

async function handleJoin(ws: ExtendedWebSocket, data: any) {
    const user = await User.findByPk(data.userId);
    const chatRoom = await ChatRoom.findByPk(data.chatRoomId);
    
    if (user && chatRoom) {
        ws.userId = user.id;
        ws.chatRoomId = chatRoom.id;
        console.log(`User ${user.id} joined chatroom ${chatRoom.id}`);
        
        const messages = await fetchRecentMessages(chatRoom.id);

        ws.send(JSON.stringify({ 
            type: 'joinSuccess', 
            chatRoomId: chatRoom.id,
            messages: messages
        }));
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid user or chatroom.' }));
    }
}

async function handleMessage(ws: ExtendedWebSocket, data: any, wss: WebSocketServer) {
    if (!ws.userId || !ws.chatRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'You must join a chatroom first.' }));
        return;
    }

    const newMessage = await Message.create({
        content: data.content,
        sentById: ws.userId,
        chatRoomId: ws.chatRoomId
    });

    console.log(`User ${ws.userId} sent a message in chatroom ${ws.chatRoomId}: ${data.content}`);

    const broadcastMessage = JSON.stringify({
        type: 'message',
        userId: ws.userId,
        content: data.content,
        timestamp: newMessage.createdAt,
        chatRoomId: ws.chatRoomId
    });

    wss.clients.forEach((client: ExtendedWebSocket) => {
        if (client.readyState === WebSocket.OPEN && client.chatRoomId === ws.chatRoomId) {
            client.send(broadcastMessage);
        }
    });
}

async function handleSwitchRoom(ws: ExtendedWebSocket, data: any) {
    if (!ws.userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'You must join a chatroom first.' }));
        return;
    }

    const chatRoom = await ChatRoom.findByPk(data.chatRoomId);
    
    if (chatRoom) {
        const oldRoomId = ws.chatRoomId;
        ws.chatRoomId = chatRoom.id;
        console.log(`User ${ws.userId} switched from chatroom ${oldRoomId} to ${chatRoom.id}`);
        
        const messages = await fetchRecentMessages(chatRoom.id);

        ws.send(JSON.stringify({ 
            type: 'switchSuccess', 
            chatRoomId: chatRoom.id,
            messages
        }));
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid chatroom.' }));
    }
}