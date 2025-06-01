const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const client = require('./db/client.cjs');
const cors = require('cors');


app.use(cors());
app.use(express.json());


const {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
} = require('./db/users.cjs');

const {
  createMovie,
  getAllMovies,
  getMovieById,
  deleteMovie,
} = require('./db/movies.cjs');

const {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
} = require('./db/reviews.cjs');

client.connect();

app.get('/', (req, res, next) => {
  res.send('WELCOME!');
})

app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await createUser(username, password);
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    user ? res.send(user) : res.status(404).send({ error: 'User not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    deleted ? res.send(deleted) : res.status(404).send({ error: 'User not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.post('/api/movies', async (req, res) => {
  try {
    const movie = await createMovie(req.body);
    res.status(201).send(movie);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/movies', async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.send(movies);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    movie ? res.send(movie) : res.status(404).send({ error: 'Movie not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  try {
    const deleted = await deleteMovie(req.params.id);
    deleted ? res.send(deleted) : res.status(404).send({ error: 'Movie not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.post('/api/reviews', async (req, res) => {
  try {
    const review = await createReview(req.body);
    res.status(201).send(review);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.send(reviews);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/api/reviews/:id', async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    review ? res.send(review) : res.status(404).send({ error: 'Review not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const deleted = await deleteReview(req.params.id);
    deleted ? res.send(deleted) : res.status(404).send({ error: 'Review not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
