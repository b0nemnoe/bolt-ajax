// bolt-backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Token kinyerése a fejlécből
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Nincs token, hozzáférés megtagadva!' });
    }

    try {
        // A "Bearer " előtag levágása, ha ott van
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

        // 2. Token ellenőrzése
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'titkoskulcs123');
        
        // 3. A felhasználó adatainak elmentése a kérésbe (req.user)
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Érvénytelen token!' });
    }
};