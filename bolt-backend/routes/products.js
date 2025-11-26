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
    console.log("--> GET /api/products hívás érkezett!"); // Jelez, ha bejön a kérés
    
    try {
        // Ellenőrizzük, hogy a modell létezik-e
        if (!Product) {
            console.error("HIBA: A Product modell nincs betöltve!");
            throw new Error("A Product modell hiányzik");
        }

        console.log("--> Adatbázis lekérdezés indítása...");
        const products = await Product.find();
        console.log(`--> Siker! Talált termékek száma: ${products.length}`);

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
        // Itt íratjuk ki a hiba TELJES részleteit a konzolra
        console.error("!!! VÉGZETES HIBA A LEKÉRDEZÉSKOR !!!");
        console.error(err); 
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

// POST (Új termék) - EXTRA DEBUG VERZIÓ
router.post('/', [auth, admin], (req, res) => {
    // Kézzel indítjuk a feltöltést, hogy elkaphassuk a hibáját
    const uploadMiddleware = upload.single('image');

    uploadMiddleware(req, res, async (err) => {
        // 1. HA A FELTÖLTÉS HIBÁRA FUT (Cloudinary hiba itt lesz!)
        if (err) {
            console.error("!!! SÚLYOS HIBA A KÉPFELTÖLTÉSNÉL !!!");
            console.error(JSON.stringify(err, null, 2)); // Kiírjuk a teljes hibát
            return res.status(500).json({ 
                message: "Képfeltöltési hiba", 
                error: err.message || "Ismeretlen Cloudinary hiba",
                details: err
            });
        }

        // 2. HA A FELTÖLTÉS SIKERES, MENTJÜK AZ ADATBÁZISBA
        try {
            console.log("--> Kép feltöltve, adatbázis mentés indul...");
            
            const product = new Product({
                name: req.body.name,
                unit: req.body.unit,
                desc: req.body.desc,
                store: req.body.store,
                price: req.body.price,
                image: req.file ? req.file.path : null 
            });

            const newProduct = await product.save();
            console.log("--> SIKER! Termék elmentve:", newProduct._id);
            
            res.status(201).json({
                ...newProduct._doc,
                id: newProduct._id
            });
        } catch (dbError) {
            console.error("!!! HIBA AZ ADATBÁZIS MENTÉSNÉL !!!");
            console.error(dbError);
            res.status(400).json({ message: dbError.message });
        }
    });
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