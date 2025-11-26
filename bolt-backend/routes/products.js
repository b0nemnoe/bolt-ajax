const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log("--- A PRODUCTS.JS BETÖLTŐDÖTT: CLOUDINARY VERZIÓ ---");
// --- MIDDLEWARE-EK ---
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// --- CLOUDINARY KONFIGURÁCIÓ ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- TÁROLÁSI SZABÁLYOK (Storage) ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bolt_projekt',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        const transformed = products.map(p => ({
            id: p._id,
            name: p.name,
            unit: p.unit,
            desc: p.desc,
            store: p.store,
            price: p.price,
            image: p.image
        }));
        res.json(transformed);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
    const product = new Product({
        name: req.body.name,
        unit: req.body.unit,
        desc: req.body.desc,
        store: req.body.store,
        price: req.body.price,
        image: req.file ? req.file.path : null 
    });

    try {
        const newProduct = await product.save();
        res.status(201).json({
            ...newProduct._doc,
            id: newProduct._id
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Termék törölve' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;