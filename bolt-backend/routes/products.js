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

router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        const validCategories = categories.filter(c => c).sort();
        res.json(validCategories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    console.log("--> GET /api/products hívás érkezett (pagination)!");
    
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);
        const search = typeof req.query.search === 'string' ? req.query.search : '';
        const category = typeof req.query.category === 'string' ? req.query.category : 'all';
        const sort = typeof req.query.sort === 'string' ? req.query.sort : 'default';
        const inStock = req.query.inStock === 'true';

        const escapeRegex = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let query = {};
        
        if (search) {
            const escapedSearch = escapeRegex(search);
            query.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { desc: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        if (category !== 'all') {
            query.category = category;
        }

        if (inStock) {
            query.store = { $gt: 0 };
        }

        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        else if (sort === 'desc') sortOption.price = -1;
        else sortOption._id = -1; // default sort latest first

        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const transformed = products.map(p => ({
            _id: p._id,
            name: p.name,
            category: p.category,
            unit: p.unit,
            desc: p.desc,
            store: p.store,
            price: p.price,
            image: p.image
        }));
        
        res.json({
            products: transformed,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit) || 1,
            totalProducts
        });
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
            _id: product._id,
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
    upload.single('image'),
    body('name').notEmpty().withMessage('A termék neve kötelező!').trim(),
    body('price').isNumeric().withMessage('Az árnak számnak kell lennie!'),
    body('category').optional().isString().trim(),
    body('unit').optional().isString().trim(),
    body('desc').optional().isString().trim(),
    body('store').optional().isNumeric().withMessage('A készletnek számnak kell lennie!'),
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
        res.status(201).json({
            ...newProduct._doc,
            _id: newProduct._id
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
    body('store').optional().isNumeric().withMessage('A készletnek számnak kell lennie!'),
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
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Termék nem található' });
        }
        res.json({ message: 'Termék törölve' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;