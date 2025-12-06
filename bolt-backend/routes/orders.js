const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendOrderConfirmation = require('../utils/emailService');

router.post('/', auth, async (req, res) => {
    const { items, totalPrice } = req.body;

    try {
        const newOrder = new Order({
            user: req.user.id,
            items: items,
            totalPrice: totalPrice
        });

        const savedOrder = await newOrder.save();
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { store: -item.quantity }
            });
        }

        const user = await User.findById(req.user.id);
        
        if (user && user.email) {
            sendOrderConfirmation(user.email, savedOrder);
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/all', [auth, admin], async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'email') 
            .sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', [auth, admin], async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;