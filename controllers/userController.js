const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Register User
exports.registerUser = async (req, res) => {
    const { email, username, password } = req.body;
  
    // Simple validation
    if (!email, !username, !password) {
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
      }
  
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists.' });
      }
  
      // Create a new user
      const newUser = new User({ email, username, password });
  
      // Encrypt password before saving the user
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
  
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully.', user: { email, username } });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetToken = resetToken;
        user.expireToken = Date.now() + 3600000;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `
                You requested for password reset
                Click on this link to reset your password: 
                http://${req.headers.host}/reset-password/${resetToken}
            `,
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
            } else {
                res.status(200).json('Recovery email sent');
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.resetPassword = async (req, res) => {
    const { resetToken, password } = req.body;

    try {
        let user = await User.findOne({
            resetToken,
            expireToken: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token invalid or expired' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.resetToken = undefined;
        user.expireToken = undefined;

        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
