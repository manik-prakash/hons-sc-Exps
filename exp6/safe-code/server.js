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

app.use(session({
  secret: 'safe-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'strict',
    httpOnly: true
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
  req.session.user = 'victim';
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.redirect('/dashboard.html');
});

app.get('/csrf-token', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ token: req.session.csrfToken });
});

app.get('/balance', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ balance });
});

app.post('/transfer', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin.startsWith(EXPECTED_ORIGIN)) {
    return res.status(403).json({ error: 'Forbidden: Invalid origin' });
  }

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
