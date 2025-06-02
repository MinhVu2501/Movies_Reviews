const client = require('./client.js');
const bcryptjs = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const createUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  try {
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    const { rows } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username;
      `,
      [username, hashedPassword]
    );

    return rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

const getUserByUsername = async (username) => {
  if (!username) {
    throw new Error('Username is required');
  }

  try {
    const { rows } = await client.query(
      `SELECT id, username, password FROM users WHERE username = $1;`,
      [username]
    );
    return rows[0];
  } catch (err) {
    console.error('Error fetching user by username:', err);
    throw err;
  }
};

const authenticateUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  try {
    
    const user = await getUserByUsername(username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }

    
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username 
      },
      JWT_SECRET,
      { 
        expiresIn: '24h'
      }
    );

    
    return {
      user: {
        id: user.id,
        username: user.username
      },
      token
    };
  } catch (err) {
    console.error('Error authenticating user:', err);
    throw err;
  }
};

const getAllUsers = async () => {
  try {
    const { rows } = await client.query(
      `SELECT id, username FROM users;`
    );
    return rows;
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
};

const getUserById = async (id) => {
  try {
    const { rows } = await client.query(
      `SELECT id, username FROM users WHERE id = $1;`,
      [id]
    );
    return rows[0];
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    throw err;
  }
};

const deleteUser = async (id) => {
  try {
    const { rows } = await client.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username;`,
      [id]
    );
    return rows[0];
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  createUser,
  getUserByUsername,
  authenticateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  verifyToken,
};