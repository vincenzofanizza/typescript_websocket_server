import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  throw new Error('PG_CONNECTION_STRING is not defined in the environment variables');
}

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres'
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Supabase PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

export default sequelize;