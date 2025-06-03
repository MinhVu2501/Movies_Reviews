const client = require('./client.js');
const bcrypt = require('bcryptjs');

async function createUser({ email, username, password }) {
  if (!email || !username || !password) {
    throw new Error('Missing required fields');
  }

  // Check if username already exists
  const userByUsername = await client.query(
    `SELECT id FROM users WHERE username=$1`,
    [username]
  );
  if (userByUsername.rows.length > 0) {
    throw new Error('Username already exists');
  }

  // Check if email already exists
  const userByEmail = await client.query(
    `SELECT id FROM users WHERE email=$1`,
    [email]
  );
  if (userByEmail.rows.length > 0) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows } = await client.query(
    `
    INSERT INTO users(email, username, password)
    VALUES ($1, $2, $3)
    RETURNING id, email, username;
    `,
    [email, username, hashedPassword]
  );
  return rows[0];
}

async function getUserByUsername(username) {
  if (!username) return null;
  const { rows } = await client.query(
    `SELECT * FROM users WHERE username=$1`,
    [username]
  );
  return rows[0] || null;
}

async function getUserByEmail(email) {
  if (!email) return null;
  const { rows } = await client.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );
  return rows[0] || null;
}

async function getUserById(id) {
  const { rows } = await client.query(
    `SELECT id, email, username FROM users WHERE id=$1`,
    [id]
  );
  return rows[0] || null;
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, email, username FROM users`
  );
  return rows;
}

async function deleteUser(id) {
  const { rows } = await client.query(
    `DELETE FROM users WHERE id=$1 RETURNING id, email, username`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  getAllUsers,
  deleteUser,
};
