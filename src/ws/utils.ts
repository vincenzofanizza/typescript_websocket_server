import WebSocket from 'ws';
import Message from '../db/Message';
import User from '../db/User';
import ChatRoom from '../db/ChatRoom';

export interface ExtendedWebSocket extends WebSocket {
    userId?: string;
    chatRoomId?: string;
}

export interface WebSocketMessage {
    type: string;
    userId?: string;
    chatRoomId?: string;
    content?: string;
}

export async function fetchRecentMessages(chatRoomId: string) {
    const recentMessages = await Message.findAll({
        where: { chatRoomId: chatRoomId },
        order: [['createdAt', 'DESC']],
        limit: 50,
        include: [{ model: User, as: 'sentBy' }]
    });
    return recentMessages.reverse();
}

export async function handleJoin(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (ws.userId && ws.userId !== data.userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'User ID mismatch.' }));
        return;
    }

    const user = await User.findByPk(data.userId);
    const chatRoom = await ChatRoom.findByPk(data.chatRoomId);
    
    if (user && chatRoom) {
        ws.userId = user.supabaseId;
        ws.chatRoomId = chatRoom.id;
        console.log(`User ${user.supabaseId} joined chatroom ${chatRoom.id}`);
        
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

export async function handleMessage(ws: ExtendedWebSocket, data: WebSocketMessage, wss: WebSocket.Server) {
    if (!ws.userId || !ws.chatRoomId) {
        ws.send(JSON.stringify({ type: 'error', message: 'You must join a chatroom first.' }));
        return;
    }

    if (data.userId && ws.userId !== data.userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'User ID mismatch.' }));
        return;
    }

    const newMessage = await Message.create({
        content: data.content,
        sentById: ws.userId,
        chatRoomId: ws.chatRoomId
    })
    .then(newMessage => {
        return Message.findByPk(newMessage.id, {
            include: [{ model: User, as: 'sentBy' }]
        });
    })

    console.log(`User ${ws.userId} sent a message in chatroom ${ws.chatRoomId}: ${data.content}`);

    const broadcastMessage = JSON.stringify({
        type: 'message',
        chatRoomId: ws.chatRoomId,
        message: newMessage
    });

    wss.clients.forEach((client: ExtendedWebSocket) => {
        if (client.readyState === WebSocket.OPEN && client.chatRoomId === ws.chatRoomId) {
            client.send(broadcastMessage);
        }
    });
}

export async function handleSwitchRoom(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'You must join a chatroom first.' }));
        return;
    }

    if (data.userId && ws.userId !== data.userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'User ID mismatch.' }));
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
