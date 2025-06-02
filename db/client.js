require('dotenv').config();
const { Client } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = client;