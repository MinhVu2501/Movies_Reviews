const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const client = require('./db/client.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

app.use(cors());
app.use(express.json());

const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  deleteUser,
} = require('./db/users.js');

const {
  createMovie,
  getAllMovies,
  getMovieById,
  deleteMovie,
} = require('./db/movies.js');

const {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
} = require('./db/reviews.js');

client.connect();

app.use(express.static(path.join(__dirname, `dist`)));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).send({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await createUser(username, password);
    res.status(201).send({ message: 'User created successfully', user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
   
    const user = await getUserByUsername(username);
    
    if (!user) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

   
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.send({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    user ? res.send(user) : res.status(404).send({ error: 'User not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
   
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).send({ error: 'Unauthorized to delete this user' });
    }
    
    const deleted = await deleteUser(req.params.id);
    deleted ? res.send(deleted) : res.status(404).send({ error: 'User not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.post('/api/movies', authenticateToken, async (req, res) => {
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

app.delete('/api/movies/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await deleteMovie(req.params.id);
    deleted ? res.send(deleted) : res.status(404).send({ error: 'Movie not found' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    
    const reviewData = { ...req.body, user_id: req.user.id };
    const review = await createReview(reviewData);
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

app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    
    const review = await getReviewById(req.params.id);
    if (!review) {
      return res.status(404).send({ error: 'Review not found' });
    }
    
    if (review.user_id !== req.user.id) {
      return res.status(403).send({ error: 'Unauthorized to delete this review' });
    }
    
    const deleted = await deleteReview(req.params.id);
    res.send(deleted);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});