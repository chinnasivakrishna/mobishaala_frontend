// src/components/ClassRoom/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { roomService } from '../../services/api';
import VideoRoom from '../VideoRoom';
import Chat from '../Chat';
import './ClassRoom.css';

const ClassRoom = () => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const { roomId } = useParams();

  const fetchToken = useCallback(async () => {
    try {
      const response = await roomService.getToken(roomId);
      setToken(response.data.token);
      setError(null);
    } catch (error) {
      console.error('Error fetching token:', error);
      setError('Failed to join the room. Please try again.');
    }
  }, [roomId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!token) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="classroom">
      <div className="main-content">
        <VideoRoom token={token} roomId={roomId} />
      </div>
      <div className="sidebar">
        <Chat roomId={roomId} />
      </div>
    </div>
  );
};

export default ClassRoom;