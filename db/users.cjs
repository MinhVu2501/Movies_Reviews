const client = require('./client.cjs');
const bcrypt = require('bcryptjs');


const createUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  try {
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
};
