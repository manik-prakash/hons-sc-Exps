const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const path = require('path');
const cors = require('cors');

const db = require('./db');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('./auth');

const app = express();
const PORT = 3000;

// Allow Vite dev server to call the API
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// ─── SECURE FEATURE 2: XSS Prevention via Helmet (sets CSP + security headers) ───
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'"],
    },
  },
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// ─── SECURE FEATURE 5: Session config for CSRF middleware ───────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,       // JS cannot read cookie
    sameSite: 'strict',   // CSRF mitigation layer 2
    secure: false,        // set true in production (HTTPS)
    maxAge: 3600000,
  },
}));

// ─── SECURE FEATURE 3: CSRF Protection ──────────────────────────────────────
const csrfProtection = csrf({ cookie: false }); // uses session store

// ─── JWT Auth middleware ─────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.clearCookie('token');
    res.redirect('/');
  }
}

// Escape HTML to prevent XSS when inserting user content into responses
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Serve login page
app.get('/', csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve register page
app.get('/register', csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Provide CSRF token to frontend via API
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ─── Input validation helpers ────────────────────────────────────────────────
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_RE = /^.{6,72}$/;

function validateUsername(u) {
  if (!u || typeof u !== 'string') return 'Username is required.';
  if (!USERNAME_RE.test(u)) return 'Username must be 3–20 characters (letters, numbers, underscores only).';
  return null;
}

function validatePassword(p) {
  if (!p || typeof p !== 'string') return 'Password is required.';
  if (!PASSWORD_RE.test(p)) return 'Password must be 6–72 characters.';
  return null;
}

// Register
app.post('/register', csrfProtection, async (req, res) => {
  const { username, password } = req.body;

  const usernameErr = validateUsername(username);
  if (usernameErr) return res.status(400).json({ error: usernameErr });

  const passwordErr = validatePassword(password);
  if (passwordErr) return res.status(400).json({ error: passwordErr });

  try {
    // SECURE FEATURE 1: Hash password before storing
    const hash = await hashPassword(password);
    // SECURE FEATURE 4: Parameterized query — no SQLi possible
    db.createUser.run(username, hash);
    res.json({ success: true, message: 'Registered! Please log in.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

// Login
app.post('/login', csrfProtection, async (req, res) => {
  const { username, password } = req.body;

  const usernameErr = validateUsername(username);
  if (usernameErr) return res.status(400).json({ error: usernameErr });

  const passwordErr = validatePassword(password);
  if (passwordErr) return res.status(400).json({ error: passwordErr });

  // SECURE FEATURE 4: Parameterized query prevents ' OR '1'='1 attacks
  const user = db.findUser.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // SECURE FEATURE 5: Issue JWT stored in httpOnly cookie
  const token = signToken({ userId: user.id, username: user.username });
  res.cookie('token', token, {
    httpOnly: true,     // not accessible via document.cookie
    sameSite: 'strict',
    secure: false,      // true in production
    maxAge: 3600000,
  });

  res.json({ success: true });
});

// Dashboard data API — returns JSON for the React frontend
app.get('/dashboard-data', requireAuth, csrfProtection, (req, res) => {
  const messages = db.getMessages.all();
  res.json({
    username: req.user.username,
    messages,
    csrfToken: req.csrfToken(),
  });
});

// Post message (protected + CSRF)
app.post('/message', requireAuth, csrfProtection, (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }
  if (content.trim().length > 300) {
    return res.status(400).json({ error: 'Message too long (max 300 characters).' });
  }
  // SECURE FEATURE 4: Parameterized insert
  db.addMessage.run(req.user.userId, content.trim());
  res.json({ success: true });
});

// Logout
app.post('/logout', requireAuth, csrfProtection, (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n✔ Secure App running at http://localhost:${PORT}`);
  console.log('  Features: Hashing | XSS | CSRF | SQLi Prevention | JWT Auth\n');
});
