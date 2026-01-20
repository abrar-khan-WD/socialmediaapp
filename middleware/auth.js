const Users = require('../models/userModel');
const jwt = require('jsonwebtoken');



const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ msg: 'You are not authorized' });
        }

        // Handle 'Bearer <token>' format
        if (token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        if (!token) {
            return res.status(401).json({ msg: 'You are not authorized' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) {
            return res.status(401).json({ msg: 'You are not authorized' });
        }

        const user = await Users.findOne({ _id: decoded.id });

        if (!user) return res.status(401).json({ msg: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        // Token verification errors should be 401
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Invalid or expired token' });
        }

        return res.status(500).json({ msg: err.message });
    }
};



module.exports = auth;