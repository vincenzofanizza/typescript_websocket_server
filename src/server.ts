import { createServer } from 'http';
import sequelize from './db/sequelize';
import { createApi } from './api/router';
import { initializeWebSocket } from './ws/server';
import { defineAssociations } from './db/associations';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;

const apiApp = createApi();
const server = createServer(apiApp);

// Create database and tables if they don't exist
sequelize.sync().then(() => {
  defineAssociations();
  console.log('Database & tables created!');
  
  initializeWebSocket(server);

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Error synchronizing the database:', error);
});