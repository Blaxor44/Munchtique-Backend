const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to database
connectDB();

// Signup endpoint
app.post('/api/users/signup', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Simple validation
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully.', user: { email, username } });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// Routes
app.use('/api/users', require('./routes/User'));

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
