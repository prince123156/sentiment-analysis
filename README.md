# Real-Time Chat Application with Sentiment Analysis

A MERN chat application where users communicate in real time and every message is analyzed by a separate FastAPI sentiment service. Messages are marked as positive, neutral, or negative, and highly negative room activity can trigger a warning banner.

## Features

- JWT register/login flow
- Protected React routes
- Socket.IO real-time messaging
- Room creation and joining
- Typing indicators
- Online/offline user status
- Unread message counts
- Sentiment indicator on every message
- Negative conversation warning banner
- Dashboard with message totals, active users, rooms, sentiment distribution, and activity trends
- Dark mode
- FastAPI sentiment service with VADER
- Fallback behavior when the sentiment service is unavailable
- MongoDB indexes for room and timestamp queries

## Tech Stack

Frontend:
- React
- Tailwind CSS
- Socket.IO Client
- Axios
- React Router
- Recharts

Backend:
- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose
- JWT

Sentiment Service:
- FastAPI
- VADER Sentiment

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── sockets
│   │   └── utils
│   ├── Dockerfile
│   └── package.json
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   └── pages
│   ├── Dockerfile
│   └── package.json
├── sentiment-service
│   ├── app
│   ├── Dockerfile
│   └── requirements.txt
└── docker-compose.yml
```

## Local Setup

### 1. Start MongoDB and the sentiment service with Docker

```bash
docker compose up --build mongo sentiment-service
```

### 2. Start the backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

### 3. Start the frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker Setup

Run MongoDB, backend, and sentiment service:

```bash
docker compose up --build
```

For frontend development, run the Vite frontend locally so hot reload works:

```bash
cd frontend
npm install
npm run dev
```

## Message Flow

1. A user sends a message from the React app.
2. Socket.IO sends the message to the Express backend.
3. The backend sanitizes the text.
4. The backend calls the FastAPI sentiment service.
5. The sentiment service returns a label and score.
6. The backend stores the message in MongoDB.
7. Socket.IO broadcasts the saved message to the room.
8. The frontend shows the message with a sentiment color indicator.

If the sentiment service is unavailable, the backend stores and broadcasts the message with neutral sentiment and marks the sentiment source as unavailable.

## API Endpoints

Backend:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/rooms`
- `POST /api/rooms`
- `POST /api/rooms/:roomId/join`
- `GET /api/rooms/:roomId/messages`
- `GET /api/dashboard`

Sentiment service:
- `GET /health`
- `POST /analyze`

## Socket Events

Client emits:
- `room:join`
- `room:leave`
- `typing:start`
- `typing:stop`
- `message:send`

Server emits:
- `message:new`
- `typing:start`
- `typing:stop`
- `sentiment:alert`
- `user:status`
- `room:presence`
- `error:message`

## Future Improvements

- Redis adapter for Socket.IO scaling
- Message search
- Room-level moderation controls
- File and image messages
- More advanced toxicity detection
- End-to-end test coverage
