const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { sendOrderConfirmation } = require('../utils/emailService');

router.post('/', auth, async (req, res) => {
    const { items, couponCode } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'A rendelés üres!' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let calculatedTotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            
            if (!product) {
                throw new Error(`A termék nem található: ${item.name}`);
            }

            if (product.store < item.quantity) {
                throw new Error(`Nincs elég készleten a következő termékből: ${product.name}`);
            }

            calculatedTotal += product.price * item.quantity;


            await Product.findByIdAndUpdate(
                item.productId, 
                { $inc: { store: -item.quantity } },
                { session }
            );

            processedItems.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });
        }

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true }).session(session);
            if (coupon) {
                const discount = Math.round(calculatedTotal * (coupon.discountPercent / 100));
                calculatedTotal -= discount;
            }
        }

        const newOrder = new Order({
            user: req.user.id,
            items: processedItems,
            totalPrice: calculatedTotal
        });

        const savedOrder = await newOrder.save({ session });
        
        await session.commitTransaction();
        session.endSession();

        const user = await User.findById(req.user.id);
        
        if (user && user.email) {
            sendOrderConfirmation(user.email, savedOrder);
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: err.message });
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