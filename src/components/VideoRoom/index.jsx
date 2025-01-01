// src/components/VideoRoom/index.jsx
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import RecordRTC from 'recordrtc';
import {
  selectPeers,
  useHMSActions,
  useHMSStore,
  selectLocalPeer,
  selectIsConnectedToRoom,
  selectCameraStreamByPeerID,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled
} from '@100mslive/react-sdk';
import { useAuth } from '../../context/AuthContext';
import { roomService } from '../../services/api';
import './VideoRoom.css';

const VideoTile = ({ peer, isLocal }) => {
  const videoRef = useRef(null);
  const hmsActions = useHMSActions();
  const videoTrack = useHMSStore(selectCameraStreamByPeerID(peer.id));

  useEffect(() => {
    if (videoRef.current && videoTrack) {
      if (videoTrack.enabled) {
        hmsActions.attachVideo(videoTrack.id, videoRef.current);
      } else {
        hmsActions.detachVideo(videoTrack.id, videoRef.current);
      }
    }
  }, [videoTrack, hmsActions]);

  return (
    <div className="video-tile">
      <video
        ref={videoRef}
        className={!videoTrack?.enabled ? 'hidden' : ''}
        autoPlay
        muted={isLocal}
        playsInline
      />
      {!videoTrack?.enabled && (
        <div className="video-off-indicator">
          <i className="fas fa-user-circle"></i>
          <div>{peer.name || 'Peer'}</div>
        </div>
      )}
      <div className="peer-name">
        <i className="fas fa-user"></i> {peer.name || 'Peer'} {isLocal ? '(You)' : ''}
      </div>
    </div>
  );
};

const VideoRoom = ({ token, roomId }) => {
  const navigate = useNavigate();
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const [isJoining, setIsJoining] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { user, logout } = useAuth();
  const [recorder, setRecorder] = useState(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initRoom = async () => {
      if (!token || isJoining) return;

      try {
        setIsJoining(true);
        await hmsActions.join({
          authToken: token,
          settings: {
            isAudioMuted: true,
            isVideoMuted: true
          }
        });
        
        if (mounted) {
          setIsJoining(false);
        }
      } catch (error) {
        console.error('Error joining room:', error);
        if (mounted) {
          setIsJoining(false);
          navigate('/');
        }
      }
    };

    initRoom();

    return () => {
      mounted = false;
      if (isConnected) {
        const cleanup = async () => {
          try {
            if (isRecording) {
              await stopRecording();
            }
            await hmsActions.leave();
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        };
        cleanup();
      }
    };
  }, [token, hmsActions]);

  const leaveRoom = async () => {
    try {
      if (isRecording) {
        await stopRecording();
      }
      await hmsActions.leave();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving room:', error);
      // Force navigation even if there's an error
      navigate('/dashboard');
    }
  };

  const startRecording = async (audioOnly = false) => {
    try {
      console.log(`Starting ${audioOnly ? 'audio-only' : 'video and audio'} recording...`);
      
      if (!audioOnly) {
        // Video + Audio Recording
        const videoGrid = document.querySelector('.video-grid');
        if (!videoGrid) {
          throw new Error('Video grid not found');
        }

        // Set up screen capture
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: 1280,
            height: 720,
            frameRate: 30
          }
        });

        // Get audio stream
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });

        // Combine streams
        const combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);

        streamRef.current = combinedStream;

        // Configure RecordRTC for video
        const recordRTC = new RecordRTC(combinedStream, {
          type: 'video',
          mimeType: 'video/webm',
          frameRate: 30,
          quality: 10,
          width: 1280,
          height: 720,
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000,
          recorderType: RecordRTC.MediaStreamRecorder,
          timeSlice: 1000,
          ondataavailable: (blob) => {
            console.log('Recording data available, size:', blob.size);
          }
        });

        console.log('Starting video recording...');
        recordRTC.startRecording();
        setRecorder(recordRTC);

      } else {
        // Audio-only Recording
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });

        streamRef.current = audioStream;

        // Configure RecordRTC for audio
        const recordRTC = new RecordRTC(audioStream, {
          type: 'audio',
          mimeType: 'audio/webm',
          audioBitsPerSecond: 128000,
          recorderType: RecordRTC.MediaStreamRecorder,
          timeSlice: 1000,
          ondataavailable: (blob) => {
            console.log('Audio recording data available, size:', blob.size);
          }
        });

        console.log('Starting audio recording...');
        recordRTC.startRecording();
        setRecorder(recordRTC);
      }

      setIsRecording(true);
      setIsAudioOnly(audioOnly);
      await roomService.startRecording(roomId);
      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setIsAudioOnly(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recorder && isRecording) {
        console.log('Stopping recording...');

        return new Promise((resolve) => {
          recorder.stopRecording(async () => {
            try {
              const blob = recorder.getBlob();
              console.log('Recording stopped, blob size:', blob.size);

              if (blob.size === 0) {
                throw new Error('Recording blob is empty');
              }

              // Create download link
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const fileExtension = isAudioOnly ? 'webm' : 'webm';
              const filePrefix = isAudioOnly ? 'audio' : 'recording';
              a.href = url;
              a.download = `${filePrefix}-${timestamp}.${fileExtension}`;

              // Create form data for upload
              const formData = new FormData();
              formData.append('recording', blob, a.download);
              formData.append('roomId', roomId);
              formData.append('timestamp', new Date().toISOString());
              formData.append('isAudioOnly', isAudioOnly);

              // Upload to backend
              await roomService.saveRecording(roomId, formData);

              // Trigger download
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);

              // Cleanup
              URL.revokeObjectURL(url);
              recorder.destroy();
              setRecorder(null);
              setIsRecording(false);
              setIsAudioOnly(false);

              // Stop all tracks
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
              }

              await roomService.stopRecording(roomId);
              console.log('Recording cleanup completed');
              resolve();
            } catch (error) {
              console.error('Error in stop recording callback:', error);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const toggleAudio = async () => {
    try {
      await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isJoining || !isConnected) {
    return (
      <div className="loading">
        <h2>Joining room...</h2>
        <p>Please wait while we connect you to the room</p>
      </div>
    );
  }

  return (
    <div className="video-room">
      <div className="main-content">
        <div className="header">
          <h2><i className="fas fa-video"></i> Live Class</h2>
        </div>
        <div className="video-grid">
          {peers.map((peer) => (
            <VideoTile 
              key={peer.id} 
              peer={peer} 
              isLocal={peer.id === localPeer?.id}
            />
          ))}
        </div>
        <div className="controls">
          <button 
            onClick={toggleAudio} 
            className={!isLocalAudioEnabled ? 'muted' : ''}
          >
            <i className={`fas ${isLocalAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
            {isLocalAudioEnabled ? 'Mute' : 'Unmute'}
          </button>
          
          <button 
            onClick={toggleVideo} 
            className={!isLocalVideoEnabled ? 'muted' : ''}
          >
            <i className={`fas ${isLocalVideoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
            {isLocalVideoEnabled ? 'Stop Video' : 'Start Video'}
          </button>
          
          <div className="recording-controls">
            {!isRecording ? (
              <>
                <button 
                  onClick={() => startRecording(false)}
                  className="record-video-btn"
                >
                  <i className="fas fa-record-vinyl"></i> Record Video
                </button>
                <button 
                  onClick={() => startRecording(true)}
                  className="record-audio-btn"
                >
                  <i className="fas fa-microphone"></i> Record Audio
                </button>
              </>
            ) : (
              <button 
                onClick={stopRecording}
                className="stop-recording-btn"
              >
                <i className="fas fa-stop-circle"></i> 
                Stop {isAudioOnly ? 'Audio' : 'Video'} Recording
              </button>
            )}
          </div>
          
          <button className="leave-btn" onClick={leaveRoom}>
            <i className="fas fa-door-open"></i> Leave Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;