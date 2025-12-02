const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba' });
    }
});

router.post('/toggle', auth, async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const index = user.wishlist.indexOf(productId);

        if (index === -1) {
            user.wishlist.push(productId);
            await user.save();
            return res.json({ message: 'Hozzáadva a kívánságlistához', added: true });
        } else {
            user.wishlist.splice(index, 1);
            await user.save();
            return res.json({ message: 'Eltávolítva a kívánságlistából', added: false });
        }
    } catch (err) {
        res.status(500).json({ message: 'Hiba történt a módosításkor' });
    }
});

module.exports = router;