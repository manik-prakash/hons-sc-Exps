# Secure App — Backend

Express.js REST API demonstrating 5 secure coding practices for Lab CA Exp 8.

## Stack

- **Runtime:** Node.js
- **Framework:** Express 4
- **Database:** SQLite via `better-sqlite3`
- **Auth:** JWT (`jsonwebtoken`) stored in `httpOnly` cookies
- **Security middleware:** `helmet`, `csurf`, `bcrypt`, `cors`

## Security Features

| # | Feature | Implementation |
|---|---------|---------------|
| 1 | Password Hashing | `bcrypt.hash()` with saltRounds=12 — passwords never stored as plaintext |
| 2 | XSS Prevention | `helmet` sets Content Security Policy; all user output HTML-escaped server-side |
| 3 | CSRF Protection | `csurf` middleware — every POST requires a signed `_csrf` token |
| 4 | SQL Injection Prevention | All queries use `?` parameterized placeholders via `better-sqlite3` |
| 5 | JWT Auth | Signed tokens stored in `httpOnly; SameSite=Strict` cookies — inaccessible to JS |

## Project Structure

```
backend/
├── server.js       # Express app — routes, middleware, security config
├── auth.js         # bcrypt + JWT helpers
├── db.js           # SQLite setup and prepared statements
├── users.db        # SQLite database (auto-created on first run)
└── package.json
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/csrf-token` | No | Returns a fresh CSRF token |
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT cookie |
| GET | `/dashboard-data` | JWT | Returns username, messages, CSRF token |
| POST | `/message` | JWT | Post a message to the board |
| POST | `/logout` | JWT | Clears the JWT cookie |

## Setup & Run

```bash
cd backend
npm install
node server.js
# Server runs at http://localhost:3000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `change-this-in-production` | Secret for signing JWT tokens |
| `SESSION_SECRET` | `session-secret-change-in-prod` | Secret for session store |

> Set these as real secrets in production — never use the defaults.
