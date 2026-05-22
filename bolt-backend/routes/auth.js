const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    return jwt.sign({ id: user._id }, refreshSecret, { expiresIn: '7d' });
};

const setRefreshCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Túl sok próbálkozás! Kérjük, várj 15 percet.' }
});

router.post('/register', [
    authLimiter,
    body('email').isEmail().withMessage('Érvénytelen email cím!'),
    body('password').isLength({ min: 6 }).withMessage('A jelszónak legalább 6 karakter hosszúnak kell lennie!'),
    validate
], async (req, res) => {
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

router.post('/login', [
    authLimiter,
    body('email').isEmail().withMessage('Érvénytelen email cím!'),
    body('password').exists().withMessage('Jelszó megadása kötelező!'),
    validate
], async (req, res) => {
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

    
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        setRefreshCookie(res, refreshToken);
        res.json({ accessToken, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });

    } catch (err) {
        res.status(500).json({ message: 'Szerverhiba' });
    }
});

router.post('/google', authLimiter, async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const googleId = payload.sub;
        const name = payload.name;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                googleId
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            if(!user.name) user.name = name;
            await user.save();
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        setRefreshCookie(res, refreshToken);
        res.json({ accessToken, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Google bejelentkezés sikertelen' });
    }
});

router.post('/facebook', authLimiter, async (req, res) => {
    const { accessToken } = req.body;
    try {
        const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        
        const { id, name, email } = data;
        
        if (!email) {
            return res.status(400).json({ message: 'A Facebook fiókhoz nincs email cím rendelve.' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                facebookId: id
            });
            await user.save();
        } else if (!user.facebookId) {
            user.facebookId = id;
            if(!user.name) user.name = name;
            await user.save();
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        setRefreshCookie(res, refreshToken);
        res.json({ accessToken, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });

    } catch (err) {
        console.error('Facebook Auth Error:', err);
        res.status(500).json({ message: 'Facebook bejelentkezés sikertelen' });
    }
});

router.put('/profile', [
    auth,
    body('name').optional().isString().trim().escape(),
    body('address').optional().isString().trim().escape(),
    validate
], async (req, res) => {
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


router.put('/password', [
    auth,
    body('currentPassword').exists().withMessage('Jelenlegi jelszó megadása kötelező!'),
    body('newPassword').isLength({ min: 6 }).withMessage('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!'),
    validate
], async (req, res) => {
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

router.post('/forgot-password', [
    authLimiter,
    body('email').isEmail().withMessage('Érvénytelen email cím!'),
    validate
], async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'Ha ez az email regisztrált, küldtünk egy levelet a jelszó visszaállításához.' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        sendPasswordResetEmail(user.email, token);

        res.json({ message: 'Ha ez az email regisztrált, küldtünk egy levelet a jelszó visszaállításához.' });

    } catch (err) {
        res.status(500).json({ message: 'Hiba történt a feldolgozás során.' });
    }
});

router.post('/reset-password/:token', [
    authLimiter,
    body('password').isLength({ min: 6 }).withMessage('A jelszónak legalább 6 karakter hosszúnak kell lennie!'),
    validate
], async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'A token érvénytelen vagy lejárt.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Sikeres jelszóváltás! Most már bejelentkezhetsz.' });

    } catch (err) {
        res.status(500).json({ message: 'Hiba történt.' });
    }
});

router.get('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Felhasználó nem található' });
        res.json(user.cart || {});
    } catch (err) {
        res.status(500).json({ message: 'Hiba a kosár lekérésekor' });
    }
});

router.put('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Felhasználó nem található' });
        
        const cart = req.body.cart || {};
        const validatedCart = {};
        
        const Product = require('../models/Product');
        
        for (const [productId, quantity] of Object.entries(cart)) {
            if (!mongoose.Types.ObjectId.isValid(productId)) continue;
            if (!Number.isInteger(quantity) || quantity <= 0) continue;
            
            const product = await Product.findById(productId);
            if (product) {
                validatedCart[productId] = quantity;
            }
        }
        
        user.cart = validatedCart;
        await user.save();
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: 'Hiba a kosár mentésekor' });
    }
});

router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Nincs érvényes munkamenet' });

    try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(refreshToken, refreshSecret);
        
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'Felhasználó nem található' });

        const accessToken = generateAccessToken(user);
        res.json({ accessToken, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
        res.status(401).json({ message: 'Lejárt vagy érvénytelen munkamenet' });
    }
});

router.post('/logout', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    res.json({ message: 'Sikeres kijelentkezés' });
});

module.exports = router;