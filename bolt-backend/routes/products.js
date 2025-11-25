const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// --- MULTER BEÁLLÍTÁSA ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ide menti a képeket
    },
    filename: function (req, file, cb) {
        // Egyedi fájlnév: mai dátum + eredeti kiterjesztés (pl. 163456789.jpg)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- ÚTVONALAK ---

// GET (Összes termék) - EZ MARAD A RÉGI
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
            image: p.image // <--- Ezt is visszaküldjük
        }));
        res.json(transformed);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST (Új termék) - MÓDOSÍTVA
// upload.single('image') -> Ez szedi ki a képet a kérésből
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
    const product = new Product({
        name: req.body.name,
        unit: req.body.unit,
        desc: req.body.desc,
        store: req.body.store,
        price: req.body.price,
        // Ha van feltöltött fájl, elmentjük a nevét, ha nincs, akkor null
        image: req.file ? req.file.filename : null 
    });

    try {
        const newProduct = await product.save();
        
        // Visszaküldjük a frontendnek ID-val együtt
        res.status(201).json({
            ...newProduct._doc,
            id: newProduct._id
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE - EZ MARAD A RÉGI
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Termék törölve' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;