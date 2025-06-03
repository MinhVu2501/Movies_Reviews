require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

const client = require('./db/client.js');

const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  deleteUser,
} = require('./db/users.js');

client.connect()
  .then(() => console.log('Connected to database'))
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).send({ error: 'Email, username, and password are required' });
  }

  try {
    const user = await createUser({ email, username, password });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).send({ message: 'User created successfully', token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, username, email, password } = req.body;
  const loginId = identifier || username || email;

  if (!loginId || !password) {
    return res.status(400).send({ error: 'Username or email and password are required' });
  }

  try {
    let user = await getUserByUsername(loginId);
    if (!user) user = await getUserByEmail(loginId);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.send({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).send({ error: 'User not found' });
    res.send({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
