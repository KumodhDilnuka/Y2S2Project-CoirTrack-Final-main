const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   GET api/feedback
// @desc    Get all feedback
// @access  Public
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/feedback
// @desc    Create feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    if (!name || !email || !message || !rating) {
      return res.status(400).json({ msg: 'Please fill in all fields' });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      name,
      email,
      message,
      rating
    });

    const feedback = await newFeedback.save();
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/feedback/:id
// @desc    Delete feedback
// @access  Admin (ideally should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }
    
    await feedback.deleteOne();
    res.json({ msg: 'Feedback deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 