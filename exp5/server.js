const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const users = [];

const findUser = (username) => users.find(u => u.username === username);

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    console.log(users);
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.'
        });
    }

    if (findUser(username)) {
        return res.status(409).json({ error: 'username already exists' });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    const newUser = {
        id: users.length + 1,
        username,
        salt,
        password: hashedPassword,
        failedAttempts: 0,
        lockoutUntil: null
    };

    users.push(newUser);
    console.log(users);
    res.status(201).json({ message: 'registration successful' });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
    }

    const user = findUser(username);
    const genericError = 'invalid username or password';

    if (!user) {
        return res.status(401).json({ error: genericError });
    }

    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
        return res.status(429).json({ error: 'account is locked due to too many failed attempts. try again later.' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        user.failedAttempts += 1;
        if (user.failedAttempts >= 5) {
            user.lockoutUntil = Date.now() + 300000;
        }
        return res.status(401).json({ error: genericError });
    }

    user.failedAttempts = 0;
    user.lockoutUntil = null;

    res.status(200).json({ message: 'login successful', username: user.username });
});

app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/cleanup', (req, res) => {
    users.length = 0;
    res.json({ message: 'database reset successfully. test users and locks cleared.' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`);
});
