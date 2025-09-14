import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Dashboard.css';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
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

    fetchUser();

    socket.current = io();

    socket.current.on('connect', () => {
      console.log('Connected to server');
      socket.current.emit('join-room', 'general');
    });

    socket.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.current.on('room-messages', (data) => {
      setMessages(data.messages);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [navigate]);

  const sendMessage = () => {
    if (newMessage.trim() && currentUser) {
      socket.current.emit('message', { room: 'general', message: newMessage });
      setNewMessage('');
    }
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
                    <h1 id="channel-title" className="text-xl tracking-tight">General Discussion</h1>
                </div>
            </div>
            <div className="flex-1 flex">
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 scrollable px-6 py-4">
                        <div id="posts-container" className="space-y-6 max-w-2xl">
                            {messages.map((msg, index) => (
                                <div key={index} className="card p-6 fade-in">
                                    <p><strong>{msg.sender}:</strong> {msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-border p-4">
                        <div className="flex items-end gap-3 max-w-2xl">
                            <div className="avatar avatar-sm">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&q=80" alt="User" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <textarea 
                                    id="message-input" 
                                    placeholder="Message #general-discussion"
                                    className="w-full p-3 bg-input border border-border rounded-lg resize-none min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
                                    rows="1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                ></textarea>
                                <div className="flex items-center justify-between mt-2">
                                    <div></div>
                                    <button onClick={sendMessage} className="btn btn-primary">
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