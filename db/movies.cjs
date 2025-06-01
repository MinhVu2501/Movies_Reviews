const client = require('./client.cjs');

const createMovie = async ({ title, genre, year, poster_url, summary }) => {
  try {
    if (!title) throw new Error('Title is required');
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
    console.error('Error creating movie:', err);
    throw err;
  }
};

const getAllMovies = async () => {
  try {
    const { rows } = await client.query('SELECT * FROM movies;');
    return rows;
  } catch (err) {
    console.error('Error fetching movies:', err);
    throw err;
  }
};

const getMovieById = async (id) => {
  try {
    const {
      rows: [movie],
    } = await client.query('SELECT * FROM movies WHERE id = $1;', [id]);
    return movie;
  } catch (err) {
    console.error('Error fetching movie by ID:', err);
    throw err;
  }
};

const deleteMovie = async (id) => {
  try {
    const {
      rows: [movie],
    } = await client.query('DELETE FROM movies WHERE id = $1 RETURNING *;', [id]);
    return movie;
  } catch (err) {
    console.error('Error deleting movie:', err);
    throw err;
  }
};

module.exports = {
  createMovie,
  getAllMovies,
  getMovieById,
  deleteMovie,
};
