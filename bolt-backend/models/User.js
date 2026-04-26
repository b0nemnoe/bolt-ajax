const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    googleId: { type: String, default: null },
    facebookId: { type: String, default: null },
    isAdmin: {
        type: Boolean,
        default: false
    },
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: {
        type: Map,
        of: Number,
        default: {}
    }
});

module.exports = mongoose.model('User', UserSchema);