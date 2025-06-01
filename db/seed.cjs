const client = require('./client.cjs');

const {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
} = require('./users.cjs');

const dropTables = async () => {
  try {
    await client.query(`
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS movies;
      DROP TABLE IF EXISTS users;
    `);
  } catch (err) {
    console.error('Error dropping tables:', err);
  }
};

const createTables = async () => {
  try {
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(30) UNIQUE NOT NULL,
        password VARCHAR(60) NOT NULL,
        name VARCHAR(30)
      );

      CREATE TABLE movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        year INT,
        poster_url TEXT,
        summary TEXT
      );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

const syncAndSeed = async () => {
  try {
    await client.connect();
    console.log('CONNECTED TO DB');

    console.log('DROPPING TABLES');
    await dropTables();
    console.log('TABLES DROPPED');

    console.log('CREATING TABLES');
    await createTables();
    console.log('TABLES CREATED');

    console.log('CREATING USERS');
    const alice = await createUser('alice', 'superSecretPassword123');
    const bob = await createUser('bob', 'hunter2');
    const charlie = await createUser('charlie', 'charliePass456'); 
    console.log('USERS CREATED');

    console.log('FETCHING ALL USERS');
    console.log(await getAllUsers());

    console.log(`FETCHING USER BY ID (id=${alice.id})`);
    console.log(await getUserById(alice.id));

    console.log(`DELETING USER ID ${bob.id} (bob)`);
    console.log(await deleteUser(bob.id));

    console.log('FETCHING USERS AFTER DELETE');
    console.log(await getAllUsers());

    await client.end();
    console.log('DISCONNECTED FROM DB');
  } catch (error) {
    console.error('Error in syncAndSeed:', error);
    await client.end();
  }
};

syncAndSeed();
