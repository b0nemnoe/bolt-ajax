const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log("--- A PRODUCTS.JS BETÖLTŐDÖTT ---");

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { body, matchedData } = require('express-validator');
const validate = require('../middleware/validate');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bolt_projekt',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
    console.log("--> GET /api/products hívás érkezett!");
    
    try {
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
            category: p.category,
            unit: p.unit,
            desc: p.desc,
            store: p.store,
            price: p.price,
            image: p.image
        }));
        res.json(transformed);
    } catch (err) {
        console.error("!!! VÉGZETES HIBA A LEKÉRDEZÉSKOR !!!");
        console.error(err); 
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'A termék nem található' });
        }
        
        const transformed = {
            id: product._id,
            category: product.category,
            name: product.name,
            unit: product.unit,
            desc: product.desc,
            store: product.store,
            price: product.price,
            image: product.image
        };
        
        res.json(transformed);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', [
    auth, 
    admin,
    (req, res, next) => {
        const uploadMiddleware = upload.single('image');
        uploadMiddleware(req, res, (err) => {
            if (err) {
                console.error("!!! SÚLYOS HIBA A KÉPFELTÖLTÉSNÉL !!!");
                console.error(JSON.stringify(err, null, 2));
                return res.status(500).json({ 
                    message: "Képfeltöltési hiba", 
                    error: err.message || "Ismeretlen Cloudinary hiba",
                    details: err
                });
            }
            next();
        });
    },
    body('name').notEmpty().withMessage('A termék neve kötelező!').trim(),
    body('price').isNumeric().withMessage('Az árnak számnak kell lennie!'),
    body('category').optional().isString().trim(),
    body('unit').optional().isString().trim(),
    body('desc').optional().isString().trim(),
    body('store').optional().isString().trim(),
    validate
], async (req, res) => {
    try {
        console.log("--> Kép feltöltve, adatbázis mentés indul...");
        
        const product = new Product({
            name: req.body.name,
            category: req.body.category,
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

router.put('/:id', [
    auth, 
    admin,
    body('name').optional().isString().trim(),
    body('price').optional().isNumeric().withMessage('Az árnak számnak kell lennie!'),
    body('category').optional().isString().trim(),
    body('unit').optional().isString().trim(),
    body('desc').optional().isString().trim(),
    body('store').optional().isString().trim(),
    validate
], async (req, res) => {
    try {
        const updateData = matchedData(req, { locations: ['body'] });
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "A termék nem található" });
        }

        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
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