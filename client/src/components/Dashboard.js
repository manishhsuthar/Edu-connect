import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Dashboard.css';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const socket = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/user');
        if (!response.ok) {
          navigate('/login');
          return;
        }
        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        navigate('/login');
      }
    };

    const fetchRooms = async () => {
      try {
        console.log('Fetching rooms from /api/conversations/rooms');
        const response = await fetch('/api/conversations/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const roomsData = await response.json();
        console.log('Rooms fetched successfully:', roomsData);
        // Normalize rooms: ensure _id is a string and keep only needed fields
        const normalized = roomsData.map(r => ({
          ...r,
          _id: String(r._id),
          name: r.name
        }));
        setRooms(normalized);
        if (normalized.length > 0) {
          setCurrentRoom(normalized[0]);
        } else {
          console.warn('No rooms returned from API');
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchUser();
    fetchRooms();

    socket.current = io();

    socket.current.on('connect', () => {
      console.log('Connected to server');
    });

    socket.current.on('message', (message) => {
      // Handle both old and new format
      const formattedMessage = {
        ...message,
        sender: typeof message.sender === 'string' ? { username: message.sender } : message.sender,
        text: message.text || message.message
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);
    });

    socket.current.on('room-messages', (data) => {
      console.log('Received room-messages event:', data);
      // Handle both old and new format
      const formattedMessages = data.messages.map(msg => ({
        ...msg,
        sender: typeof msg.sender === 'string' ? { username: msg.sender } : msg.sender,
        text: msg.text || msg.message // Support both field names
      }));
      setMessages(formattedMessages);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (currentRoom) {
      console.log('Switching to room:', currentRoom.name);
      const roomIdStr = String(currentRoom._id);
      socket.current.emit('join-room', roomIdStr);
      setMessages([]); // Clear messages while loading
      
      // Fetch messages from API as fallback
      const fetchMessages = async () => {
        try {
          console.log('Fetching messages for room:', currentRoom.name);
          const encodedName = encodeURIComponent(currentRoom.name);
          const response = await fetch(`/api/conversations/rooms/${encodedName}/messages`);
          if (response.ok) {
            const messagesData = await response.json();
            console.log('Messages fetched:', messagesData.length, 'items');
            setMessages(messagesData);
          } else {
            console.error('Failed to fetch messages:', response.status);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      
      // Small delay to allow socket event to fire first
      setTimeout(fetchMessages, 100);
    }
  }, [currentRoom]);

  const sendMessage = () => {
    if (newMessage.trim() && currentUser && currentRoom) {
      socket.current.emit('message', {
        conversationId: currentRoom._id,
        message: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleRoomClick = (room) => {
    if (socket.current && currentRoom) {
      try {
        socket.current.emit('leave-room', String(currentRoom._id));
        console.log('Left room:', currentRoom.name);
      } catch (e) {
        console.warn('Error leaving room:', e);
      }
    }
    // Ensure new room has string id
    const normalized = { ...room, _id: String(room._id) };
    setCurrentRoom(normalized);
  };

  return (
    <div className="flex h-screen bg-background">
      <div id="sidebar" className="sidebar sidebar-expanded flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h2 id="sidebar-title" className="sidebar-title tracking-tight">EduConnect Hub</h2>
          </div>
        </div>
        <div className="flex-1 scrollable p-2">
          <ul>
            {console.log('Rendering rooms:', rooms)}
            {rooms.length === 0 && <li className="p-2 text-gray-400">No rooms available</li>}
            {rooms.map((room) => (
              <li
                key={room._id}
                className={`p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-600 ${
                  currentRoom && currentRoom._id === room._id ? 'bg-gray-700' : ''
                }`}
                onClick={() => {
                  console.log('Room clicked:', room.name);
                  handleRoomClick(room);
                }}
              >
                {room.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="avatar avatar-sm">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&q=80" alt="User" className="w-full h-full object-cover" />
                <div className="online-indicator"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0 sidebar-text">
              <a href="/profile" className="text-sm truncate">{currentUser?.username}</a>
              <div className="text-xs text-sidebar-foreground/50">{currentUser?.role}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 id="channel-title" className="text-xl tracking-tight">{currentRoom?.name}</h1>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 scrollable px-6 py-4 chat-messages">
              <div id="posts-container" className="space-y-6 max-w-2xl">
                {messages.map((msg, index) => (
                  <div key={index} className="card p-6 fade-in">
                    <p><strong>{msg.sender?.username || 'Unknown'}:</strong> {msg.text || msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-4 message-input-container">
              <div className="flex items-end gap-3 max-w-2xl">
                <div className="avatar avatar-sm">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&q=80" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <textarea
                    id="message-input"
                    placeholder={`Message #${currentRoom?.name}`}
                    className="w-full p-3 bg-input border border-border rounded-lg resize-none min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
                    rows="1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={currentRoom?.name.toLowerCase() === 'announcements' && currentUser?.role !== 'faculty'}
                  ></textarea>
                  <div className="flex items-center justify-between mt-2">
                    <div></div>
                    <button
                      onClick={sendMessage}
                      className="btn btn-primary"
                      disabled={currentRoom?.name.toLowerCase() === 'announcements' && currentUser?.role !== 'faculty'}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;