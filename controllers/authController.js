const User = require('../models/User');
const Order = require('../models/Order'); // Assuming Order model is created
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { email, username, password, fullName, phone } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      username,
      password: hashedPassword,
      fullName,
      phone,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({ token, user: { email: user.email, username: user.username, fullName: user.fullName, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({ token, user: { email: user.email, username: user.username, fullName: user.fullName, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
    const { fullName, username, email, phone } = req.body;
  
    try {
      // Validate that req.user.id exists before using
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      // Use findByIdAndUpdate for efficiency and pass { new: true } to return the updated user
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          fullName: fullName || undefined, // This will only update if fullName is provided
          username: username || undefined,
          email: email || undefined,
          phone: phone || undefined,
        },
        { new: true, runValidators: true } // runValidators will ensure validation rules are applied
      );
  
      // If user not found
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return updated user data with success message
      res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

