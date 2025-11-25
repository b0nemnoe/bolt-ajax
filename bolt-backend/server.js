require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Adatbázis csatlakozás
connectDB();

// Middleware-ek
app.use(cors()); // Engedélyezi a Vue hívásokat
app.use(express.json()); // Engedélyezi a JSON adatfogadást
app.use('/uploads', express.static('uploads'));

// Útvonalak
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`A szerver fut a ${PORT}-es porton`);
});