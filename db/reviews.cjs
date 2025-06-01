const client = require('./client.cjs');


const createReview = async ({ userId, rating, comment = '', movieId }) => {
  if (!userId || !rating || !movieId) {
    throw new Error('userId, rating, and movieId are required');
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
    const { rows } = await client.query(`SELECT * FROM reviews;`);
    return rows;
  } catch (error) {
    throw new Error('Error fetching reviews: ' + error.message);
  }
};


const getReviewById = async (id) => {
  if (!id) throw new Error('Review ID is required');
  try {
    const { rows } = await client.query(`SELECT * FROM reviews WHERE id = $1;`, [id]);
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
