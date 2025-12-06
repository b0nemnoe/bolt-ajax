const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/validate', async (req, res) => {
    const { code } = req.body;
    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Érvénytelen kuponkód!' });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Ez a kupon már lejárt.' });
        }

        res.json({
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            message: 'Kupon sikeresen beváltva!'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', [auth, admin], async (req, res) => {
    try {
        const newCoupon = new Coupon({
            code: req.body.code,
            discountPercent: req.body.discountPercent
        });
        const savedCoupon = await newCoupon.save();
        res.status(201).json(savedCoupon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;