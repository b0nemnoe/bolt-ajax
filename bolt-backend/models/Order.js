const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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



module.exports = mongoose.model('Order', OrderSchema);