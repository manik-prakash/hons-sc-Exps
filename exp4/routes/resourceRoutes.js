const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const ROLES = require('../config/roles');

// Public Route
router.get('/public', (req, res) => {
    res.render('public', { user: req.session.user });
});

// Protected: Customer and above
// Security Principle 1: Least Privilege
router.get('/dashboard', isAuthenticated, hasRole(ROLES.CUSTOMER), (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// Protected: Editor and above
router.get('/editor', isAuthenticated, hasRole(ROLES.EDITOR), (req, res) => {
    res.render('editor', { user: req.session.user });
});

// Protected: Admin only
router.get('/admin', isAuthenticated, hasRole(ROLES.ADMIN), (req, res) => {
    res.render('admin', { user: req.session.user });
});

module.exports = router;
