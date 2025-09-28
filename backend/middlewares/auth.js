import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dsffj329ufdksafiw';

export function getUserFromToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
