const express = require('express');
const { processCheckout } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware
const router = express.Router();

// Protect the checkout route to ensure only authenticated users can access it
router.post('/', protect, processCheckout);

module.exports = router;
