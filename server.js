const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const Order = require('./models/Order'); // Import the Order model
const User = require('./models/User'); // Import the User model

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Middleware to authenticate user
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // Use your JWT secret key
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Routes
app.use('/api/users', authRoutes);

// User data endpoint
app.get('/api/user', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { fullName, username, email, phone } = user;
        res.json({ fullName, username, email, phone });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user info endpoint
app.post('/api/user', authenticate, async (req, res) => {
    try {
        const userId = req.userId; // Obtained from authentication middleware
        const { fullName, username, email, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, username, email, phone },
            { new: true } // Return the updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User info updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Checkout endpoint
app.post('/api/checkout', async (req, res) => {
  const { fullName, email, phone, address, city, postalCode, paymentMethod, cardDetails, items, totalPrice } = req.body;

  // Validate the required fields
  if (!fullName || !email || !phone || !address || !city || !postalCode || !paymentMethod || !items || !totalPrice) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // If payment method is card, validate card details
  if (paymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
      return res.status(400).json({ message: 'Please provide all card details.' });
  }

  try {
      const newOrder = new Order({
          fullName,
          email,
          phone,
          address,
          city,
          postalCode,
          paymentMethod,
          cardDetails: paymentMethod === 'card' ? cardDetails : null,
          items,
          totalPrice,
      });

      await newOrder.save();

      console.log('New Order:', newOrder);
      return res.status(200).json({ message: 'Order received successfully!', order: newOrder });
  } catch (error) {
      console.error('Error saving order:', error);
      return res.status(500).json({ message: 'Error placing order. Please try again.' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
