const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getUser, updateUser } = require('../controllers/authController');


// User registration route
router.post('/register', registerUser);

// User login route
router.post('/login', loginUser);

// Protected route to get user profile
router.get('/profile', protect, getUser);

// Protected route to update user profile
router.put('/profile', protect, updateUser);

module.exports = router;
