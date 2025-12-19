import React, { useState, useEffect } from 'react';
import './ProfileSetup.css';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    department: '',
    semester: '',
    division: '',
    college: '',
    areasOfInterest: '',
    skills: '',
    profilePhoto: '',
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error('User ID not found');
      return;
    }
    const response = await fetch('/api/auth/profile-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData, userId }),
    });

    if (response.ok) {
      localStorage.removeItem('userId');
      // Redirect to dashboard or profile page
      window.location.href = '/dashboard';
    } else {
      // Handle error
      console.error('Profile setup failed');
    }
  };

  return (
    <div className="profile-setup-container">
      <form onSubmit={handleSubmit} className="profile-setup-form">
        <h2>Profile Setup</h2>
        <div className="section">
          <h3>Academic Info</h3>
          <div className="form-group">
            <label htmlFor="enrollmentNumber">Enrollment / Roll Number</label>
            <input
              type="text"
              name="enrollmentNumber"
              id="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department / Program</label>
            <input
              type="text"
              name="department"
              id="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <input
              type="text"
              name="semester"
              id="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="division">Division / Batch</label>
            <input
              type="text"
              name="division"
              id="division"
              value={formData.division}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="college">College / Institute Name</label>
            <input
              type="text"
              name="college"
              id="college"
              value={formData.college}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="section">
          <h3>Interests (Optional)</h3>
          <div className="form-group">
            <label htmlFor="areasOfInterest">Areas of Interest (comma-separated)</label>
            <input
              type="text"
              name="areasOfInterest"
              id="areasOfInterest"
              value={formData.areasOfInterest}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="skills">Skills (for collaboration, comma-separated)</label>
            <input
              type="text"
              name="skills"
              id="skills"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePhoto">Profile Photo URL</label>
            <input
              type="text"
              name="profilePhoto"
              id="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
            />
          </div>
        </div>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
