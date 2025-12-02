const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Nincs token, hozzáférés megtagadva!' });
    }

    try {
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'titkoskulcs123');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'A token érvénytelen vagy lejárt!' });
    }
};