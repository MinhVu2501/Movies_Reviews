const client = require('./client.js');

const createReview = async ({ userId, rating, comment = '', movieId }) => {
  if (!userId || !rating || !movieId) {
    throw new Error('userId, rating, and movieId are required');
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  try {
    const { rows } = await client.query(`
      INSERT INTO reviews (user_id, rating, comment, movie_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [userId, rating, comment, movieId]);

    console.log('Inserted review:', rows[0]);
    return rows[0];
  } catch (error) {
    throw new Error('Error creating review: ' + error.message);
  }
};

const getAllReviews = async () => {
  try {
    const { rows } = await client.query(`
      SELECT reviews.*, users.username, movies.title
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      JOIN movies ON reviews.movie_id = movies.id;
    `);
    return rows;
  } catch (error) {
    throw new Error('Error fetching reviews: ' + error.message);
  }
};

const getReviewById = async (id) => {
  if (!id) throw new Error('Review ID is required');
  try {
    const { rows } = await client.query(`SELECT * FROM reviews WHERE id = $1;`, [id]);
    if (!rows[0]) throw new Error('Review not found');
    return rows[0];
  } catch (error) {
    throw new Error('Error fetching review by ID: ' + error.message);
  }
};

const deleteReview = async (id) => {
  if (!id) throw new Error('Review ID is required');
  try {
    const { rows } = await client.query(`
      DELETE FROM reviews WHERE id = $1
      RETURNING *;
    `, [id]);
    if (!rows[0]) throw new Error('Review not found');
    return rows[0];
  } catch (error) {
    throw new Error('Error deleting review: ' + error.message);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
};
