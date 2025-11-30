const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    items: [
        {
            productId: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Feldolgozás alatt',
        enum: ['Feldolgozás alatt', 'Kiszállítva', 'Teljesítve', 'Törölve']
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);