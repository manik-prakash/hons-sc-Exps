const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { registerSchema, loginSchema, validateRequest } = require('../middleware/validation');
const ROLES = require('../config/roles');

// In-memory user store (simulating a database)
const users = [];

// Register Page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// Register Action
router.post('/register', validateRequest(registerSchema), async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const userExists = users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).render('register', { error: 'User already exists' });
        }

        // Hash password
        // Security Principle 2: Fail-Safe Defaults (Strong hashing)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            role: role || ROLES.GUEST // Default to GUEST if not specified
        };

        users.push(newUser);
        res.redirect('/login');
    } catch (err) {
        res.status(500).render('error', { message: 'Error registering user', error: err });
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Login Action
router.post('/login', validateRequest(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);
        if (!user) {
            // Security Principle 2: Fail-Safe Defaults
            // Generic error message
            return res.status(400).render('login', { error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).render('login', { error: 'Invalid email or password' });
        }

        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).render('error', { message: 'Error logging in', error: err });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

module.exports = router;
