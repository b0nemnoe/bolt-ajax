// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Adatbázis kapcsolat
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB kapcsolódva a feltöltéshez...'))
  .catch(err => {
    console.error('Hiba:', err);
    process.exit(1);
  });

const importData = async () => {
  try {
    // 1. Megkeressük a bolt.json fájlt a szomszédos mappában
    // '../bolt-ajax/bolt.json' -> visszalép egyet, majd be a bolt-ajax-ba
    const jsonPath = path.join(__dirname, '..', 'bolt-ajax', 'bolt.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('HIBA: Nem találom a bolt.json fájlt ezen az útvonalon:', jsonPath);
      process.exit(1);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const products = JSON.parse(jsonData).bolt; // A "bolt" tömb kell nekünk

    // 2. Töröljük a meglévő adatokat (hogy ne duplikálódjon, ha többször futtatod)
    await Product.deleteMany({});
    console.log('Régi adatok törölve...');

    // 3. Adatok átalakítása a MongoDB sémához
    // (A "1200 Ft" árat átalakítjuk 1200 számmá)
    const productsToSave = products.map(p => ({
      name: p.name,
      unit: p.unit,
      desc: p.desc,
      store: Number(p.store),
      price: parseInt(p.price.replace(/[^0-9]/g, '')) // Kiszed minden nem szám karaktert
    }));

    // 4. Mentés
    await Product.insertMany(productsToSave);
    console.log('✅ Sikeres adatfeltöltés!');
    
    process.exit();
  } catch (error) {
    console.error('Hiba az importálás közben:', error);
    process.exit(1);
  }
};

importData();