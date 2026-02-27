const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3001;
const EXPECTED_ORIGIN = `http://localhost:${PORT}`;

let balance = 1000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DEFENSE 1: SameSite=strict prevents cookie from being sent on cross-site requests
app.use(session({
  secret: 'safe-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'strict', // blocks cookie on cross-site requests
    httpOnly: true       // prevents JS access to the cookie
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Login — generates a fresh CSRF token and stores it in the session
app.post('/login', (req, res) => {
  req.session.user = 'victim';
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.redirect('/dashboard.html');
});

// Expose CSRF token only to authenticated users (same-origin JS can read this)
app.get('/csrf-token', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ token: req.session.csrfToken });
});

app.get('/balance', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ balance });
});

// Transfer — protected by 3 layers of CSRF defense
app.post('/transfer', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  // DEFENSE 2: Origin/Referer header check — cross-site forms cannot spoof these
  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin.startsWith(EXPECTED_ORIGIN)) {
    return res.status(403).json({ error: 'Forbidden: Invalid origin' });
  }

  // DEFENSE 3: Synchronizer CSRF token — only legitimate page knows this value
  const { amount, _csrf } = req.body;
  if (!_csrf || _csrf !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Forbidden: Invalid CSRF token' });
  }

  const parsed = parseInt(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  balance -= parsed;
  res.json({ message: `Transferred ₹${parsed}. New balance: ₹${balance}` });
});

app.listen(PORT, () => {
  console.log(`Safe server running at http://localhost:${PORT}`);
});
