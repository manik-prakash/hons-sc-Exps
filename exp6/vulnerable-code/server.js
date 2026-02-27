const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "csrf-demo",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static("public"));

let balance = 1000;

// Login Route
app.post("/login", (req, res) => {
  req.session.user = "victim";
  res.redirect("/dashboard.html");
});

// Check Session
app.get("/balance", (req, res) => {
  if (!req.session.user) return res.send("Not logged in");
  res.send({ balance });
});

// Transfer Money (VULNERABLE)
app.post("/transfer", (req, res) => {
  if (!req.session.user) return res.send("Unauthorized");

  const amount = Number(req.body.amount);
  balance -= amount;

  res.send(`Transferred ₹${amount}`);
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);