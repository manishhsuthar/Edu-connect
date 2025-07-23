// filepath: /home/manish/Documents/Edu-connect_Hub/server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);