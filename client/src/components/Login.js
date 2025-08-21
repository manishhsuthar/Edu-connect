import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          [isEmail ? 'email' : 'username']: identifier, 
          password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="body-wrap">
      <div className="container">
          <div className="form-section">
              <div className={`form-container ${isRegister ? 'show-register' : ''}`}>
                  <div className="form-toggle">
                      <div className={`slider ${isRegister ? 'right' : ''}`}></div>
                      <div className={`toggle-btn ${!isRegister ? 'active' : ''}`} onClick={() => setIsRegister(false)}>Sign In</div>
                      <div className={`toggle-btn ${isRegister ? 'active' : ''}`} onClick={() => setIsRegister(true)}>Register</div>
                  </div>
                  
                  <div className="login-form">
                      <h2 className="heading">Welcome Back</h2>
                      <h4 className="subheading">Connect with thousands of educators and learners</h4>
                      <div className="form-group user-type-group">
                          <label className="user-type-option">
                              <input type="radio" name="user-type" value="student" defaultChecked />
                              <span className="custom-radio"></span>
                              <i className="fas fa-user-graduate"></i>
                              <span>Student</span>
                          </label>
                          <label className="user-type-option">
                              <input type="radio" name="user-type" value="faculty" />
                              <span className="custom-radio"></span>
                              <i className="fas fa-chalkboard-teacher"></i>
                              <span>Faculty</span>
                          </label>
                      </div>
          
                      <button className="social-btn btn-google"><i className="fab fa-google"></i> Sign in with Google</button>
                      <div className="divider">or continue with email/username</div>
                      
                      <div className="form-group">
                          <input 
                            type="text" 
                            placeholder="Email or Username" 
                            required 
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                          />
                          <i className="fas fa-user field-icon"></i>
                      </div>
                      
                      <div className="form-group">
                          <div className="password-container">
                              <input 
                                type="password" 
                                placeholder="Password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <i className="fas fa-lock field-icon"></i>
                          </div>
                      </div>
                      
                      <div className="forgot-password">
                          <a href="/forgot-password">Forgot Password</a>
                      </div>
                      
                      <button className="btn" onClick={handleLogin}>Sign In</button>
                      {error && <div className="error-message" style={{display: 'block'}}>{error}</div>}
                      
                      <div className="form-footer">
                          <p>Don't have an account? <a href="#" onClick={() => setIsRegister(true)}>Register here</a></p>
                      </div>
                  </div>
                  
                  <div className="register-form">
                      {/* Registration form can be implemented here */}
                      <h2 className="heading">Create Account</h2>
                       <div className="form-footer">
                          <p>Already have an account? <a href="#" onClick={() => setIsRegister(false)}>Sign in here</a></p>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="illustration-section">
              <div className="illustration-background"></div>
              <div className="animated-circle circle-1"></div>
              <div className="animated-circle circle-2"></div>
              <div className="animated-circle circle-3"></div>
              <img src="/Developer_activity-pana.png" height="30vh" width="auto" alt="Education Illustration" />
          </div>
      </div>
    </div>
  );
};

export default Login;