import { createServer } from 'http';
import sequelize from './db/sequelize';
import { initializeWebSocket } from './ws';

// Create database and tables if they don't exist
sequelize.sync().then(() => {
  console.log('Database & tables created!');
});

const server = createServer();
const port = 8080;

initializeWebSocket(server);

server.listen(port, () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
