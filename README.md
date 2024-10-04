# TypeScript WebSocket Server

## Introduction

Welcome to the **TypeScript WebSocket Server**! This project is a robust and scalable WebSocket server built with TypeScript, designed to power a real-time chat application. It provides the backend infrastructure for managing user connections, chat rooms, and message broadcasting.

The corresponding frontend repository can be found at: https://github.com/vincenzofanizza/typescript_websocket_client.git

## Getting Started

Follow these steps to set up and run the TypeScript WebSocket Server locally.

### Prerequisites

- **Node.js** (v14 or later)
- **npm** (v6 or later) or **yarn**
- **Supabase** account for authentication and SQL database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/typescript_websocket_server.git
   cd typescript_websocket_server
   ```

2. **Install dependencies:**

   Using npm:
   ```bash
   npm install
   ```

   Using yarn:
   ```bash
   yarn install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=8080
   PG_CONNECTION_STRING=your_postgres_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   FRONTEND_URL=http://localhost:3000
   ```

   - Replace `your_postgres_connection_string` with your PostgreSQL connection string from Supabase.
   - Replace Supabase variables with your actual Supabase project details.

4. **Run Database Migrations:**

   Ensure your PostgreSQL database is running and execute migrations to set up the necessary tables.

   ```bash
   npm run build
   npm start
   ```

   The server will automatically sync the database and create tables if they don't exist.

5. **Start the Server:**

   For development with automatic recompilation:

   ```bash
   npm run dev
   ```

   For production:

   ```bash
   npm run build
   npm start
   ```

6. **Access the Server:**

   The server will be running at `http://localhost:8080`.

## Tech Stack

- **TypeScript:** Strongly typed programming language that builds on JavaScript.
- **Node.js:** JavaScript runtime built on Chrome's V8 engine.
- **Express:** Fast, unopinionated, minimalist web framework for Node.js.
- **WebSocket (ws):** WebSocket implementation for real-time communication.
- **Sequelize:** Promise-based Node.js ORM for PostgreSQL.
- **Supabase:** Open-source Firebase alternative for authentication and database.
- **Heroku:** Cloud platform to deploy, manage, and scale applications.

## Architecture

The TypeScript WebSocket Server is structured into several key components to support the chat application's functionality.

### Main Components

1. **Express API:**
   - Handles RESTful API endpoints for authentication, user management, and chatroom operations.
   - Utilizes middleware for authentication and request parsing.

2. **WebSocket Server:**
   - Manages real-time communication between clients.
   - Handles events such as user connections, message broadcasting, and chatroom management.

3. **Database Layer:**
   - **PostgreSQL** managed through **Sequelize ORM**.
   - Models include `User`, `ChatRoom`, and `Message` with defined associations.

4. **Authentication:**
   - Integrates with **Supabase** for user authentication and management.
   - Secures API endpoints and WebSocket connections using JWT tokens.

5. **Utilities:**
   - Includes helper functions and configurations, such as Supabase clients and environment variable management.

### Deployment

- **Heroku:** The backend server is hosted on Heroku and can be accessed at [https://typescript-websocket-server-ff92ac8cf2a4.herokuapp.com](https://typescript-websocket-server-ff92ac8cf2a4.herokuapp.com). Heroku handles the deployment, scaling, and management of the server, ensuring high availability and reliability.