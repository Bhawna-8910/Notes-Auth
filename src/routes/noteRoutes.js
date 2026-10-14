const express = require('express');
const router = express.Router();
const {getNotes, createNote, updateNote, deleteNote} = require('../controllers/noteController');
const {protect} = require('../middleware/authMiddleware');

router.use(protect); // applies auth to all routes below

router.route('/').get(getNotes).post(createNote);
router.route('/:id').put(updateNote).delete(deleteNote);

module.exports = router;