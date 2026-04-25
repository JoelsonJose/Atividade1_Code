const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatarStyle: {
    type: String, // ex: 'guerreiro', 'explorador', 'estudioso'
    default: 'explorador'
  },
  favoriteColor: {
    type: String, // hex code
    default: '#4facfe'
  },
  level: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Character', characterSchema);
