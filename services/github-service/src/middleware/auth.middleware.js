const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        console.log('JWT_SECRET length:', secret ? secret.length : 'NOT SET');
        console.log('Token prefix:', token.substring(0, 20));
        req.user = jwt.verify(token, secret);
        next();
    } catch (err) {
        console.log('JWT verify error:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
