const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

const SECRET = "secretkey";

let users = [];
let loginAttempts = {};
let sessions = {};
let passwordResetTokens = {};

function isStrongPassword(password) {
  return /^(?=.*[A-Z])(?=.*[@$!%*?&]).{6,}$/.test(password);
}

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!isStrongPassword(password)) {
    return res.status(400).send("Weak password");
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).send("User already exists");
  }

  users.push({ id: users.length + 1, username, password, role: "user" });
  res.send("User registered");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!loginAttempts[username]) loginAttempts[username] = 0;

  if (loginAttempts[username] >= 5) {
    return res.status(403).send("Account locked");
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    loginAttempts[username]++;
    return res.status(401).send("Invalid credentials");
  }

  loginAttempts[username] = 0;

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "2m" }
  );

  sessions[token] = true;

  res.json({ token });
});

function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token || !sessions[token]) {
    return res.status(403).send("Unauthorized");
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).send("Session expired");
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).send("Forbidden");
  }
  next();
}

app.post("/logout", auth, (req, res) => {
  delete sessions[req.headers["authorization"]];
  res.send("Logged out");
});

app.post("/change-password", auth, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = users.find(u => u.id === req.user.id);

  if (user.password !== oldPassword) {
    return res.status(400).send("Old password incorrect");
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).send("Weak new password");
  }

  user.password = newPassword;
  res.send("Password updated");
});

app.post("/reset-request", (req, res) => {
  const { username } = req.body;

  const token = Math.random().toString(36).substring(2);
  passwordResetTokens[token] = Date.now();

  res.json({ token });
});

app.post("/reset-password", (req, res) => {
  const { token } = req.body;

  if (!passwordResetTokens[token]) {
    return res.status(400).send("Invalid token");
  }

  if (Date.now() - passwordResetTokens[token] > 60000) {
    return res.status(400).send("Token expired");
  }

  res.send("Token valid");
});

app.get("/user/:id", auth, (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  res.json(user);
});

app.get("/admin", auth, adminOnly, (req, res) => {
  res.send("Admin panel");
});

app.post("/input-test", (req, res) => {
  const { data } = req.body;

  if (typeof data !== "string") {
    return res.status(400).send("Invalid type");
  }

  if (data.includes("<script>")) {
    return res.status(400).send("XSS blocked");
  }

  res.send("Valid input");
});

let requestCount = 0;
app.get("/rate-test", (req, res) => {
  requestCount++;
  if (requestCount > 10) {
    return res.status(429).send("Too many requests");
  }
  res.send("OK");
});

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.listen(3000, () => console.log("Server running on port 3000"));