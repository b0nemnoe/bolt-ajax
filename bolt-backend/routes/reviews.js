const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
    const { productId, rating, comment } = req.body;

    try {
        const existingReview = await Review.findOne({ product: productId, user: req.user.id });
        if (existingReview) {
            return res.status(400).json({ message: 'Már értékelted ezt a terméket!' });
        }

        const newReview = new Review({
            user: req.user.id,
            product: productId,
            rating,
            comment
        });

        const savedReview = await newReview.save();
        const populatedReview = await Review.findById(savedReview._id).populate('user', 'email');
        
        res.status(201).json(populatedReview);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'email')
            .sort({ date: -1 });
        
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Nem található' });

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Nincs jogosultságod módosítani!' });
        }

        review.rating = rating;
        review.comment = comment;
        review.date = Date.now();

        const updatedReview = await review.save();
        
        const populated = await Review.findById(updatedReview._id).populate('user', 'email');
        
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Nem található' });

        if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Nincs jogosultságod törölni!' });
        }

        await review.deleteOne();
        res.json({ message: 'Értékelés törölve' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;