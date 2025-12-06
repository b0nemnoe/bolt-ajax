const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Ez az email már foglalt!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'Sikeres regisztráció!' });

    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Hibás email vagy jelszó!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Hibás email vagy jelszó!' });
        }

    
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'titkoskulcs123', 
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });

    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba' });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Felhasználó nem található' });


        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.address !== undefined) user.address = req.body.address;

        await user.save();
        
        res.json({
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            name: user.name,
            address: user.address
        });
    } catch (err) {
        res.status(500).json({ message: 'Hiba a mentéskor' });
    }
});


router.put('/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'A jelenlegi jelszó hibás!' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        res.json({ message: 'Jelszó sikeresen megváltoztatva!' });
    } catch (err) {
        res.status(500).json({ message: 'Hiba a jelszóváltáskor' });
    }
});


module.exports = router;