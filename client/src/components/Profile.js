import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/user');
        if (!response.ok) {
          navigate('/login');
          return;
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST' });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="body-wrap">
      <div className="w-full max-w-2xl mx-auto">
          <div className="card p-8 space-y-6">
              <div className="flex items-center gap-6">
                  <div className="relative">
                      <img id="profile-avatar" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&q=80" alt="User Avatar" className="w-24 h-24 rounded-full object-cover" />
                      <button className="absolute bottom-0 right-0 bg-primary rounded-full p-2" title="Change avatar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9.012a2 2 0 0 0 1.61-3.405l-2.86-4.304a2 2 0 0 0-3.406 0L12 19.5V20Z"/><path d="m5 12-2.09 2.787a2 2 0 0 0 1.61 3.405H12v-2.5l-4.5-6.75a2 2 0 0 0-3.406 0L5 12Z"/><circle cx="12" cy="9" r="3"/></svg>
                      </button>
                  </div>
                  <div>
                      <h1 id="profile-username" className="text-3xl font-bold">{user.username}</h1>
                      <p id="profile-role" className="text-lg text-gray-400">{user.role}</p>
                  </div>
              </div>

              <div>
                  <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                  <div className="space-y-4">
                      <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                          <input type="email" id="profile-email" className="input" value={user.email} readOnly />
                      </div>
                      <div>
                          <label htmlFor="username-edit" className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                          <input type="text" id="profile-username-edit" className="input" defaultValue={user.username} />
                      </div>
                  </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border">
                  <button onClick={handleLogout} className="btn btn-destructive">Logout</button>
                  <div>
                      <a href="/dashboard" className="btn btn-secondary">Cancel</a>
                      <button className="btn btn-primary">Save Changes</button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;