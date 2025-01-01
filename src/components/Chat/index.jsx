// src/components/Chat/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  useHMSStore,
  useHMSActions,
  selectHMSMessages,
  selectLocalPeer
} from '@100mslive/react-sdk';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const messagesRef = useRef(null);
  const [message, setMessage] = useState('');
  const messages = useHMSStore(selectHMSMessages);
  const localPeer = useHMSStore(selectLocalPeer);
  const hmsActions = useHMSActions();
  const { user } = useAuth();

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Include sender's name in the message
      const messageData = {
        message: message.trim(),
        senderName: user?.name || user?.email?.split('@')[0] || 'Anonymous'
      };
      hmsActions.sendBroadcastMessage(JSON.stringify(messageData));
      setMessage('');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (msg) => {
    try {
      const parsedMsg = JSON.parse(msg.message);
      return {
        text: parsedMsg.message,
        senderName: parsedMsg.senderName
      };
    } catch (e) {
      // Fallback for old messages
      return {
        text: msg.message,
        senderName: msg.sender?.name || 'Anonymous'
      };
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Class Chat</h3>
      </div>
      
      <div className="messages" ref={messagesRef}>
        {messages.map((msg, index) => {
          const { text, senderName } = renderMessage(msg);
          return (
            <div 
              key={`${msg.id}-${index}`}
              className={`message ${msg.sender?.id === localPeer?.id ? 'sent' : 'received'}`}
            >
              <div className="message-header">
                <span className="sender-name">{senderName}</span>
                <span className="message-time">
                  {formatTime(msg.time)}
                </span>
              </div>
              <div className="message-content">
                {text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message as ${user?.name || user?.email?.split('@')[0] || 'Anonymous'}...`}
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;