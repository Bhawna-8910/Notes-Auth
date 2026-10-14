const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indexed for query performance when filtering by user
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 120
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);