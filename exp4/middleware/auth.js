const ROLES = require('../config/roles');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Security Principle 1: Least Privilege
// Check if user has a specific role
const hasRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Simple role hierarchy check could be implemented here
        // simple hierarchy: Admin > Editor > Customer > Guest
        const roleHierarchy = [ROLES.GUEST, ROLES.CUSTOMER, ROLES.EDITOR, ROLES.ADMIN];
        const userRoleIndex = roleHierarchy.indexOf(req.session.user.role);
        const requiredRoleIndex = roleHierarchy.indexOf(role);

        if (userRoleIndex >= requiredRoleIndex) {
            return next();
        }

        res.status(403).render('error', {
            message: 'Access Denied: You do not have permission to view this resource.',
            error: {}
        });
    };
};

module.exports = {
    isAuthenticated,
    hasRole
};
