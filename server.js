const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const Order = require('./models/Order'); // Import the Order model
const User = require('./models/User'); // Import the User model

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Routes
app.use('/api/users', authRoutes);

// User data endpoint
app.get('/api/user', async (req, res) => {
    try {
      // Fetch user data here
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Update user info endpoint
app.post('/api/user', async (req, res) => {
  try {
    // Assume user is authenticated and the ID is obtained from the request
    const userId = req.user.id; // This should come from your authentication middleware

    const { name, username, email } = req.body;

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, username, email },
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

// Endpoint to handle checkout submissions
app.post('/api/checkout', async (req, res) => {
    const { name, address, city, postalCode, phone, email, paymentMethod, cardDetails, items, totalPrice } = req.body;

    // Validate data (basic example, adjust as per your needs)
    if (!name || !address || !city || !postalCode || !phone || !email || !paymentMethod || !items || !totalPrice) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const newOrder = new Order({
            name,
            address,
            city,
            postalCode,
            phone,
            email,
            paymentMethod,
            cardDetails: paymentMethod === 'card' ? cardDetails : null,
            items, // Store ordered items
            totalPrice, // Store total price
        });

        await newOrder.save(); // Save the order to the database

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
