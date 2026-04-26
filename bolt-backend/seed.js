// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

// Adatbázis kapcsolat
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB kapcsolódva a feltöltéshez...'))
  .catch(err => {
    console.error('Hiba:', err);
    process.exit(1);
  });

const products = [
  {
    name: 'Prémium Vezeték Nélküli Fejhallgató',
    category: 'Elektronika',
    unit: 'db',
    desc: 'Zajszűrős, kristálytiszta hangzású fejhallgató 30 órás üzemidővel.',
    store: 15,
    price: 45000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Okosóra Pro',
    category: 'Elektronika',
    unit: 'db',
    desc: 'Vízálló okosóra pulzusmérővel és beépített GPS-szel.',
    store: 8,
    price: 89000,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Ergonomikus Irodai Szék',
    category: 'Otthon',
    unit: 'db',
    desc: 'Kényelmes, gerinckímélő forgószék hosszú munkához.',
    store: 5,
    price: 65000,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Minimalista Falióra',
    category: 'Otthon',
    unit: 'db',
    desc: 'Csendes működésű, modern dizájnú falióra.',
    store: 20,
    price: 12000,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Férfi Bőrdzseki',
    category: 'Ruházat',
    unit: 'db',
    desc: 'Valódi bőrből készült, stílusos őszi/tavaszi dzseki.',
    store: 12,
    price: 110000,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Női Futócipő',
    category: 'Sport',
    unit: 'pár',
    desc: 'Könnyű, légáteresztő futócipő aszfaltra.',
    store: 25,
    price: 32000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Jóga Matrac',
    category: 'Sport',
    unit: 'db',
    desc: 'Csúszásmentes, környezetbarát jógamatrac.',
    store: 30,
    price: 8500,
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Kézműves Kerámia Bögre',
    category: 'Otthon',
    unit: 'db',
    desc: 'Egyedi mintás kerámia bögre teához, kávéhoz.',
    store: 40,
    price: 4500,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Hordozható Bluetooth Hangszóró',
    category: 'Elektronika',
    unit: 'db',
    desc: 'Erőteljes basszus, vízálló kivitel, 12 óra lejátszás.',
    store: 18,
    price: 24000,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Női Napszemüveg',
    category: 'Ruházat',
    unit: 'db',
    desc: 'UV400 védelemmel ellátott divatos napszemüveg.',
    store: 50,
    price: 15000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Kemping Sátor',
    category: 'Sport',
    unit: 'db',
    desc: '2 személyes, könnyen felállítható vízálló sátor.',
    store: 6,
    price: 55000,
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Okostelefon Gimbal',
    category: 'Elektronika',
    unit: 'db',
    desc: '3 tengelyes képstabilizátor mobiltelefonokhoz.',
    store: 10,
    price: 35000,
    image: 'https://images.unsplash.com/photo-1585250005703-f11ddf4e3c88?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Pamut Póló',
    category: 'Ruházat',
    unit: 'db',
    desc: '100% organikus pamut póló, többféle méretben.',
    store: 100,
    price: 5900,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Dekoratív Asztali Lámpa',
    category: 'Otthon',
    unit: 'db',
    desc: 'Meleg fényű, fa talpas asztali lámpa.',
    store: 22,
    price: 18500,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Kézi Súlyzó Készlet',
    category: 'Sport',
    unit: 'szett',
    desc: '15kg-os, állítható súlyú egykezes súlyzó szett.',
    store: 15,
    price: 22000,
    image: 'https://images.unsplash.com/photo-1586401700818-192e212dc9ce?q=80&w=600&auto=format&fit=crop'
  }
];

const coupons = [
  { code: 'START20', discountPercent: 20 },
  { code: 'BOLT10', discountPercent: 10 },
  { code: 'FREE50', discountPercent: 50 }
];

const importData = async () => {
  try {
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Régi adatok törölve...');

    await Product.insertMany(products);
    await Coupon.insertMany(coupons);
    console.log('✅ Sikeres adatfeltöltés (15 termék és 3 kupon)!');
    
    process.exit();
  } catch (error) {
    console.error('Hiba az importálás közben:', error);
    process.exit(1);
  }
};

importData();