const express = require('express');
const { registerUser, loginUser, updateUser, getUser} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/user', protect, updateUser); // For updating user details
router.get('/user', protect, getUser); // For fetching user details

module.exports = router;
