// bolt-backend/routes/orders.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Rendelés leadása (POST /api/orders)
// A második paraméter az "auth", ami védi az útvonalat
router.post('/', auth, async (req, res) => {
    const { items, totalPrice } = req.body;

    try {
        const newOrder = new Order({
            user: req.user.id, // Ezt a middleware-ből kapjuk meg
            items: items,
            totalPrice: totalPrice
        });

        const savedOrder = await newOrder.save();

        for (const item of items) {

            await Product.findByIdAndUpdate(item.productId, {
                $inc: { store: -item.quantity }
            })
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Saját rendelések lekérése (GET /api/orders)
router.get('/', auth, async (req, res) => {
    try {
        // Megkeressük azokat a rendeléseket, ahol a user ID egyezik a belépett felhasználóéval
        // .sort({ date: -1 }) -> A legfrissebb legyen elöl
        const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;