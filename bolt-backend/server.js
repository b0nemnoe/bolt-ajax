require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

app.set('trust proxy', 1);

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 5000,
    message: 'Túl sok kérés érkezett erről az IP címről. Kérjük, próbáld újra később.'
});

connectDB();

app.use(cors({
    origin: ['http://localhost:5173', 'https://nemethnoelshop.netlify.app'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/', globalLimiter);
app.use('/uploads', express.static('uploads'));
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons'));

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR");
    console.error(err.stack || err);
    
    if (err.name === 'MulterError' || (err.message && err.message.includes('Cloudinary'))) {
        return res.status(500).json({ 
            message: 'Képfeltöltési hiba',
            error: err.message
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Váratlan szerverhiba történt'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`A szerver fut a ${PORT}-es porton`);
});