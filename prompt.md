# Real-Time Chat Application with Sentiment Analysis

## Project Overview

This project was created to combine a real-time chat experience with lightweight sentiment analysis. The goal was to make communication feel more interactive while also surfacing emotional tone in each message.

The core idea is simple:

- Users chat in rooms in real time.
- Messages are analyzed in the background.
- The UI shows a sentiment indicator for each message.
- The system also supports warnings for highly negative conversations.

## Key Features

### Real-Time Messaging

- Instant message delivery with Socket.IO
- Room creation and joining
- Typing indicators
- Unread message counts
- Online/offline user status
- Active room highlighting
- Smooth room switching

### Sentiment Analysis

- Message sentiment is classified as positive, neutral, or negative
- Sentiment data is displayed directly in the chat UI
- Negative conversation detection can trigger warning banners
- Fallback handling keeps chat working even if the analysis service is unavailable

### Frontend Experience

- React + Tailwind CSS
- Responsive layout for desktop and mobile
- Dark mode support
- Clean message cards with sender name, timestamp, avatar initials, and sentiment state
- Sidebar showing rooms, unread counts, and active users

### Authentication and Security

- JWT-based authentication
- Register and login flow
- Validation for required fields, email format, and password length
- Protected routes
- Input sanitization
- Basic request limiting and secure socket access

### Dashboard

- Total message count
- Sentiment distribution
- Active user tracking
- Message activity trends

### Backend and Services

- Node.js and Express.js backend
- MongoDB storage for users, rooms, and messages
- Separate Python FastAPI service for sentiment analysis
- VADER used as the lightweight sentiment engine

## Technical Decisions

### Why a Separate Python Service?

Keeping the sentiment logic in a separate Python service made the system easier to test, debug, and evolve. It also prevented the Node backend from becoming overloaded with NLP concerns.

### Why Use VADER?

VADER is lightweight and works well for short chat messages. For this use case, it offers a strong balance between accuracy and simplicity.

## Development Notes

- Docker Compose was used to run the full stack consistently.
- Performance improvements were added after testing, including memoization and debounced typing events.
- The project was kept focused on the main product goals rather than adding unnecessary features.

## Technologies

### Frontend

- React
- Tailwind CSS
- Socket.IO Client
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Socket.IO

### Sentiment Service

- FastAPI
- VADER

## Deployment

- Frontend can be deployed to Vercel
- Backend and supporting services can be deployed to Railway or Render
- Docker Compose supports local development and testing

## Summary

This project delivers a practical real-time chat application with sentiment analysis, modular service separation, authentication, and a dashboard. The design prioritizes reliability, maintainability, and a clean user experience while keeping the implementation focused on the core requirements.
