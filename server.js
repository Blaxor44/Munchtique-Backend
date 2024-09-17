const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes'); // Correct path
const { protect } = require('./middleware/authMiddleware');
const User = require('./models/User');

// Initialize environment variables and connect to database
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'https://munchtique-frontend.vercel.app/',
  }));

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
app.use('/api/checkout', checkoutRoutes); // Ensure this matches the route file

// Fetch user data endpoint
app.get('/api/user', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Don't return the password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user); // Send user data back to frontend
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user info endpoint (PUT)
app.put('/api/user', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, username, email, phone } = req.body;

        // Update user in the database
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));