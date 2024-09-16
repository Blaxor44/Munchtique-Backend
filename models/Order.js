const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    fullName: {type: String},
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    cardDetails: { 
        cardNumber: { type: String },
        expiryDate: { type: String },
        cvv: { type: String }
    },
    items: { type: Array, required: true },
    totalPrice: { type: Number, required: true },
});

module.exports = mongoose.model('Order', OrderSchema);