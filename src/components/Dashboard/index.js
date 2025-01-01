// src/components/Dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { roomService } from '../../services/api';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    enableRecording: false,
    scheduledFor: '',
    duration: 60
  });
  const [joinRoomId, setJoinRoomId] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch rooms when component mounts and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roomService.getRooms();
      console.log('API Response:', response);
      console.log('Current user ID:', user?.id);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Filter rooms where the user is the creator
      const userRooms = Array.isArray(response.data) 
        ? response.data.filter(room => {
            console.log('Room data:', room);
            
            // Check if createdBy exists and compare its _id with user.id
            const creatorId = room.createdBy?._id;
            console.log('Creator ID:', creatorId, 'User ID:', user?.id);
            
            return creatorId === user?.id;
          })
        : [];
        
      console.log('Filtered user rooms:', userRooms);
      
      setRooms(userRooms);
      localStorage.setItem('userRooms', JSON.stringify(userRooms));
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms');
      
      const cachedRooms = localStorage.getItem('userRooms');
      if (cachedRooms) {
        try {
          const parsedRooms = JSON.parse(cachedRooms);
          setRooms(parsedRooms);
        } catch (e) {
          console.error('Error parsing cached rooms:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newRoom = {
        ...roomData,
        createdBy: {
          _id: user.id,
          email: user.email,
          name: user.name
        }
      };

      console.log('Creating room with data:', newRoom);

      const response = await roomService.createRoom(newRoom);
      console.log('Room creation response:', response);

      if (!response.data) {
        throw new Error('No data received from server after room creation');
      }

      // Add new room to state and localStorage
      const updatedRooms = [...rooms, response.data];
      setRooms(updatedRooms);
      localStorage.setItem('userRooms', JSON.stringify(updatedRooms));

      // Reset form
      setRoomData({
        name: '',
        description: '',
        enableRecording: false,
        scheduledFor: '',
        duration: 60
      });

      // Refresh rooms list
      await fetchRooms();

      // Show success message
      alert('Class created successfully!');
    } catch (error) {
      console.error('Error creating room:', error);
      alert(`Failed to create class: ${error.message}`);
    }
  };

  const joinRoomById = async (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId}`);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userRooms');
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Current rooms state:', rooms);
  }, [rooms]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading your classes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading classes</h2>
        <p>{error}</p>
        <button onClick={fetchRooms}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Live Classes Dashboard</h1>
        <div className="user-controls">
          <span className="welcome-message">Welcome, {user?.name || user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Join Room by ID */}
      <div className="join-room-section">
        <h2><i className="fas fa-door-open"></i> Join a Class</h2>
        <form onSubmit={joinRoomById} className="join-room-form">
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Enter Room ID"
            required
          />
          <button type="submit">
            <i className="fas fa-sign-in-alt"></i> Join
          </button>
        </form>
      </div>

      {/* Create Room Form */}
      <div className="create-room-section">
        <h2><i className="fas fa-plus-circle"></i> Create a New Class</h2>
        <form onSubmit={createRoom} className="create-room-form">
          <div className="input-group">
            <i className="fas fa-chalkboard"></i>
            <input
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData({...roomData, name: e.target.value})}
              placeholder="Enter class name"
              required
            />
          </div>
          <div className="input-group">
            <i className="fas fa-align-left"></i>
            <textarea
              value={roomData.description}
              onChange={(e) => setRoomData({...roomData, description: e.target.value})}
              placeholder="Class description"
            />
          </div>
          <div className="form-group">
            <label>
              <i className="fas fa-video"></i>
              <input
                type="checkbox"
                checked={roomData.enableRecording}
                onChange={(e) => setRoomData({...roomData, enableRecording: e.target.checked})}
              />
              Enable Recording
            </label>
          </div>
          <div className="input-group">
            <i className="far fa-calendar-alt"></i>
            <input
              type="datetime-local"
              value={roomData.scheduledFor}
              onChange={(e) => setRoomData({...roomData, scheduledFor: e.target.value})}
              required
            />
          </div>
          <div className="input-group">
            <i className="fas fa-clock"></i>
            <input
              type="number"
              value={roomData.duration}
              onChange={(e) => setRoomData({...roomData, duration: parseInt(e.target.value)})}
              placeholder="Duration (minutes)"
              min="15"
              max="180"
            />
          </div>
          <button type="submit">
            <i className="fas fa-plus"></i> Create Class
          </button>
        </form>
      </div>

      {/* Rooms Grid */}
      <div className="rooms-section">
        <h2><i className="fas fa-th"></i> Your Classes</h2>
        {rooms.length === 0 ? (
          <p className="no-rooms">
            <i className="fas fa-info-circle"></i> No classes created yet.
          </p>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room._id} className="room-card">
                <h3><i className="fas fa-chalkboard-teacher"></i> {room.name}</h3>
                <p className="room-description">
                  <i className="fas fa-info-circle"></i> {room.description}
                </p>
                <div className="room-details">
                  <p><i className="fas fa-fingerprint"></i> <strong>Room ID:</strong> {room.roomId}</p>
                  <p><i className="far fa-calendar-alt"></i> <strong>Scheduled for:</strong> {new Date(room.scheduledFor).toLocaleString()}</p>
                  <p><i className="fas fa-clock"></i> <strong>Duration:</strong> {room.duration} minutes</p>
                  <p><i className="fas fa-video"></i> <strong>Recording:</strong> {room.enableRecording ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="room-actions">
                  <button 
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    className="join-button"
                  >
                    <i className="fas fa-sign-in-alt"></i> Join Room
                  </button>
                  <div className="share-info">
                    <p><i className="fas fa-share-alt"></i> Share this Room ID:</p>
                    <div className="copy-section">
                      <input
                        type="text"
                        value={room.roomId}
                        readOnly
                        onClick={(e) => e.target.select()}
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(room.roomId);
                          alert('Room ID copied to clipboard!');
                        }}
                        className="copy-button"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;