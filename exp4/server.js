const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const ROLES = require('./config/roles');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Principle 2: Fail-Safe Defaults & 3: Defense-in-Depth
// Helmet sets various HTTP headers for security
app.use(helmet());

// Security Principle 3: Defense-in-Depth
// Request logging
app.use(morgan('combined'));

// Security Principle 3: Defense-in-Depth
// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session management
// Security Principle 2: Fail-Safe Defaults (secure cookie settings)
app.use(session({
    secret: 'super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/', authRoutes);
app.use('/', resourceRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Security Principle 2: Fail-Safe Defaults
// Centralized Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Don't leak stack traces to user
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
