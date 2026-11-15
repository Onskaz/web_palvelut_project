const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

