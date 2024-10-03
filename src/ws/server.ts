import WebSocket from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import { supabase } from '../utils/supabase';
import { ExtendedWebSocket, WebSocketMessage, handleJoin, handleMessage, handleSwitchRoom } from './utils';
import dotenv from 'dotenv';

dotenv.config();

export const initializeWebSocket = async (server: Server) => {
    const wss = new WebSocket.Server({ noServer: true });

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
                const data = JSON.parse(message.toString()) as WebSocketMessage;

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

    console.log(`WebSocket server is running on port ${process.env.PORT}`);
}