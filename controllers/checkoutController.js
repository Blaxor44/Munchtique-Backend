const Order = require('../models/Order'); // Import the Order model

exports.processCheckout = async (req, res) => {
    const {
        fullName,
        email,
        phone,
        address,
        city,
        postalCode,
        paymentMethod,
        cardDetails,
        items,
        totalPrice
    } = req.body;

    // Ensure the user is authenticated by checking if req.user is available (from protect middleware)
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Validate required fields
    if (!fullName || !email || !phone || !address || !city || !postalCode || !paymentMethod || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate card details if payment method is 'card'
    if (paymentMethod === 'card' && (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
        return res.status(400).json({ message: 'Missing card details for card payment' });
    }

    try {
        // Create a new order using authenticated user (req.user.id)
        const newOrder = new Order({
            user: req.user.id, // Attach the user's ID from the decoded token
            name: fullName,
            email,
            phone,
            address,
            city,
            postalCode,
            paymentMethod,
            cardDetails: paymentMethod === 'card' ? cardDetails : null,
            items,
            totalPrice
        });

        // Save the order to the database
        await newOrder.save();

        // Return a success response with the newly created order ID
        res.status(200).json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
