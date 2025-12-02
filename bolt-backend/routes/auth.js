// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- REGISZTRÁCIÓ (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Megnézzük, létezik-e már
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Ez az email már foglalt!' });
        }

        // 2. Jelszó titkosítása
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Felhasználó létrehozása
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

module.exports = router;