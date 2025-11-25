// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // Nem lehet két ugyanilyen email
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false // Alapból nem admin
    }
});

module.exports = mongoose.model('User', UserSchema);