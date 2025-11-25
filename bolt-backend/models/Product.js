const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    store: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }
});

module.exports = mongoose.model('Product', ProductSchema);