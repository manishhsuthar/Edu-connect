const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, unique: true },
    type: { type: String, enum: ['dm', 'group'], default: 'group' },
    description: { type: String },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

