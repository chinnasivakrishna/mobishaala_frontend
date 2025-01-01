
# MobiShaala - Interactive Online Learning Platform

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Usage](#usage)
8. [API Documentation](#api-documentation)
9. [WebSocket Integration](#websocket-integration)
10. [Video/Audio Features](#videoaudio-features)
11. [Security](#security)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

## Overview
MobiShaala is a comprehensive online learning platform that enables real-time video classes, audio/video recording, and interactive learning experiences. The platform supports both teachers and students with role-based access and features.

### Purpose
- Facilitate remote learning through live video classes
- Enable recording of sessions for future reference
- Provide interactive learning experiences
- Support both synchronous and asynchronous learning

## Features

### Authentication
- User registration with role selection (Teacher/Student)
- Secure login with JWT authentication
- Password encryption using bcrypt
- Role-based access control

### Video Conferencing
- Real-time video/audio streaming using 100ms SDK
- Multiple participant support
- Screen sharing capabilities
- Video/Audio mute controls
- Recording functionality

### Class Management
- Create and schedule classes
- Join classes using unique room IDs
- Record sessions (video/audio)
- View recorded sessions
- Real-time chat during sessions

## Technology Stack

### Frontend
- React.js
- 100ms SDK for video
- WebSocket for real-time communication
- Axios for HTTP requests
- Font Awesome for icons
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MongoDB
- WebSocket (Socket.io)
- JWT for authentication
- 100ms API integration

## Architecture

### Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── VideoRoom/
│   │   └── Common/
│   ├── services/
│   │   ├── api.js
│   │   └── websocket.js
│   ├── context/
│   │   └── AuthContext.js
│   └── App.js
```

### Backend Structure
```
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── server.js
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- 100ms account and credentials
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env # Configure environment variables
npm start
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Configure environment variables
npm start
```

## Configuration

### Environment Variables
```env
# Frontend
REACT_APP_API_URL=https://mobishaala-backend.onrender.com/api
REACT_APP_WS_URL=wss://mobishaala-backend.onrender.com
REACT_APP_HMS_ENDPOINT=https://prod-in2.100ms.live
REACT_APP_HMS_TEMPLATE_ID=your_template_id

# Backend
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
HMS_ACCESS_KEY=your_100ms_access_key
HMS_SECRET=your_100ms_secret
```

## Video/Audio Features

### Recording Implementation
1. Uses RecordRTC for client-side recording
2. Supports both video and audio-only recording
3. Implements chunked upload for large files
4. Stores recordings in cloud storage

### Recording Process
```javascript
// Start Recording
const startRecording = async (audioOnly = false) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: !audioOnly,
    audio: true
  });
  const recorder = new RecordRTC(stream, {
    type: 'video',
    mimeType: 'video/webm'
  });
  recorder.startRecording();
};

// Stop Recording
const stopRecording = async () => {
  recorder.stopRecording(() => {
    const blob = recorder.getBlob();
    uploadRecording(blob);
  });
};
```

## WebSocket Integration

### Real-time Communication
- Uses WebSocket for real-time updates
- Handles reconnection automatically
- Implements heartbeat mechanism
- Manages room-specific events

### Event Handling
```javascript
wsService.subscribe('user-joined', handleUserJoined);
wsService.subscribe('user-left', handleUserLeft);
wsService.subscribe('chat-message', handleChatMessage);
```

## Security

### Implemented Security Measures
1. JWT Authentication
2. Password Hashing
3. CORS Protection
4. Rate Limiting
5. Input Validation
6. XSS Protection
7. CSRF Protection

## Advantages
1. Real-time interactive learning
2. Recording capabilities for future reference
3. Role-based access control
4. Scalable architecture
5. Cross-platform compatibility
6. Low latency video streaming
7. Secure communication

## Disadvantages
1. Requires stable internet connection
2. Browser compatibility issues
3. Storage limitations for recordings
4. Bandwidth consumption
5. Initial setup complexity

## Troubleshooting

### Common Issues
1. Video/Audio not working
   - Check browser permissions
   - Verify device connections
   - Clear browser cache

2. Connection Issues
   - Check internet connectivity
   - Verify WebSocket connection
   - Check API endpoint status

3. Recording Issues
   - Verify storage permissions
   - Check available disk space
   - Ensure proper encoding support

```

This README provides:
1. Complete project overview
2. Detailed setup instructions
3. Architecture explanation
4. Feature documentation
5. Security considerations
6. Troubleshooting guide
7. Configuration details
8. Code examples
9. Best practices
10. Support information
