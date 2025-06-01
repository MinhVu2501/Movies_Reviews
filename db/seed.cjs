const client = require('./client.cjs');

const {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
} = require('./users.cjs');

const {
  createMovie,
  getAllMovies,
  getMovieById,
  deleteMovie,
} = require('./movies.cjs');

const {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
} = require('./reviews.cjs');

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

    console.log('CREATING MOVIES');
    const inception = await createMovie({
      title: 'Inception',
      genre: 'Sci-Fi',
      year: 2010,
      poster_url: 'http://example.com/inception.jpg',
      summary: 'A mind-bending thriller...',
    });

    const godfather = await createMovie({
      title: 'The Godfather',
      genre: 'Crime',
      year: 1972,
      poster_url: 'http://example.com/godfather.jpg',
      summary: 'Classic mafia drama.',
    });
    console.log('MOVIES CREATED');

    console.log('CREATING REVIEWS');
    const review1 = await createReview({
      userId: alice.id,
      movieId: inception.id,
      rating: 4,
      comment: 'Really enjoyed this movie!',
    });

    const review2 = await createReview({
      userId: bob.id,
      movieId: godfather.id,
      rating: 5,
      comment: 'Masterpiece.',
    });

    const review3 = await createReview({
      userId: charlie.id,
      movieId: godfather.id,
      rating: 3,
      comment: 'Pretty good!',
    }); 

    console.log('REVIEWS CREATED');

    console.log('FETCHING ALL USERS');
    console.log(await getAllUsers());

    console.log(`FETCHING USER BY ID (id=${alice.id})`);
    console.log(await getUserById(alice.id));

    console.log(`DELETING USER ID ${bob.id} (bob)`);
    console.log(await deleteUser(bob.id));

    console.log('FETCHING USERS AFTER DELETE');
    console.log(await getAllUsers());

    console.log('FETCHING ALL MOVIES');
    console.log(await getAllMovies());

    console.log(`FETCHING MOVIE BY ID (id=${inception.id})`);
    console.log(await getMovieById(inception.id));

    console.log(`DELETING MOVIE ID ${inception.id}`);
    console.log(await deleteMovie(inception.id));

    console.log('FETCHING MOVIES AFTER DELETE');
    console.log(await getAllMovies());

    console.log('FETCHING ALL REVIEWS');
    console.log(await getAllReviews());

    console.log(`FETCHING REVIEW BY ID (id=${review2.id})`);
    console.log(await getReviewById(review2.id));

    console.log(`DELETING REVIEW ID ${review2.id}`);
    console.log(await deleteReview(review2.id));

    console.log('REVIEWS AFTER DELETE');
    console.log(await getAllReviews());

    await client.end();
    console.log('DISCONNECTED FROM DB');
  } catch (error) {
    console.error('Error in syncAndSeed:', error);
    await client.end();
  }
};

syncAndSeed();
