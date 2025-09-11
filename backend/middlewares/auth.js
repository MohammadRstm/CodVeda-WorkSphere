const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dsffj329ufdksafiw';

function auth(req, res, next) {
  const header = req.headers['authorization']; // fixed: should be req.headers not req.header
  const token = header && header.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attaches user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token , consider logging in again' });
  }
}

module.exports = auth;
