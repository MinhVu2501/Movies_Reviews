const client = require('./client.js');

const createMovie = async ({ title, genre, year, poster_url, summary }) => {
  try {
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required and must be a string');
    }

    if (year && isNaN(parseInt(year))) {
      throw new Error('Year must be a number');
    }

    const { rows: existing } = await client.query(
      `SELECT * FROM movies WHERE LOWER(title) = LOWER($1) AND year = $2;`,
      [title, year]
    );
    if (existing.length > 0) {
      throw new Error('Movie already exists');
    }

    const {
      rows: [movie],
    } = await client.query(
      `
      INSERT INTO movies (title, genre, year, poster_url, summary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
      [title, genre, year, poster_url, summary]
    );
    return movie;
  } catch (err) {
    console.error('Error creating movie:', err.message);
    throw err;
  }
};

const getAllMovies = async () => {
  try {
    const { rows } = await client.query('SELECT * FROM movies ORDER BY year DESC;');
    return rows;
  } catch (err) {
    console.error('Error fetching movies:', err.message);
    throw err;
  }
};

const getMovieById = async (id) => {
  try {
    const {
      rows: [movie],
    } = await client.query('SELECT * FROM movies WHERE id = $1;', [id]);
    if (!movie) throw new Error('Movie not found');
    return movie;
  } catch (err) {
    console.error('Error fetching movie by ID:', err.message);
    throw err;
  }
};

const deleteMovie = async (id) => {
  try {
    const {
      rows: [movie],
    } = await client.query('DELETE FROM movies WHERE id = $1 RETURNING *;', [id]);
    if (!movie) throw new Error('Movie not found or already deleted');
    return movie;
  } catch (err) {
    console.error('Error deleting movie:', err.message);
    throw err;
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  deleteMovie,
};
