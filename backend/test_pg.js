const { Client } = require('pg');
require('dotenv').config();

console.log('Using URL:', process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => {
    console.log('Successfully connected to database via pg!');
    return client.query('SELECT 1;');
  })
  .then((res) => {
    console.log('Query result:', res.rows);
    return client.end();
  })
  .catch((err) => {
    console.error('Connection error:', err);
    process.exit(1);
  });
