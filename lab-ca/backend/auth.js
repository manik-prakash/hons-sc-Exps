const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production-use-env-var';
const JWT_EXPIRES = '1h';

// SECURE FEATURE 1: Password Hashing with bcrypt (saltRounds=12)
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// SECURE FEATURE 5: JWT — signed token, verified on every protected request
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
