import { createServer } from 'http';
import sequelize from './db/sequelize';
import { createApi } from './api/router';
import { initializeWebSocket } from './ws';

// TODO: Add authorization to all endpoints

const port = 8080;

const apiApp = createApi();
const server = createServer(apiApp);

// Create database and tables if they don't exist
sequelize.sync().then(() => {
  console.log('Database & tables created!');
  
  initializeWebSocket(server);

  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Error synchronizing the database:', error);
});