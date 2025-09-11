const mongoose = require('mongoose');

const TutorialSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
  videoId: { type: String, required: true },
  author: { type: String, required: true },
  thumbnail: { type: String, required: true },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

module.exports = mongoose.model('Tutorial', TutorialSchema);


