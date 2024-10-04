const mongoose = require('mongoose');

const broadcastMessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BroadcastMessage', broadcastMessageSchema);