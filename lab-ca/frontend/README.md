# Secure App — Frontend

React + Vite + Tailwind CSS frontend for the Secure Coding Demo (Lab CA Exp 8).

## Stack

- **Framework:** React 19
- **Build tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 7

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx       # Login form with input validation
│   │   ├── Register.jsx    # Register form with success screen
│   │   └── Dashboard.jsx   # Protected home page — messages + security info
│   ├── App.jsx             # Route definitions
│   └── main.jsx            # React root with BrowserRouter
├── vite.config.js          # Vite config + proxy to backend
└── package.json
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Login | Username + password login, redirects to dashboard on success |
| `/register` | Register | Create account, shows success screen then link to login |
| `/dashboard` | Dashboard | Protected — shows messages board, security feature badges, logout |

## Setup & Run

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

> The backend must be running at `http://localhost:3000` before starting the frontend.

## How the Proxy Works

All `/api/*` requests from the frontend are proxied to the backend:

```
/api/login             →  http://localhost:3000/login
/api/register          →  http://localhost:3000/register
/api/dashboard-data    →  http://localhost:3000/dashboard-data
```

This is configured in `vite.config.js` and only applies during development.

## Input Validation

Validation runs on the frontend before any network request, and is re-enforced on the backend:

| Field | Rule |
|-------|------|
| Username | Required, 3–20 chars, letters/numbers/underscores only |
| Password | Required, 6–72 characters |
| Message | Required, max 300 characters |
