'use strict';

const pg = require('pg');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();
const conString = 'postgres://william:test@localhost:5432/kilovolt';// TODO: Don't forget to set your own conString
const client = new pg.Client(conString);
client.connect();
client.on('error', function(error) {
  console.error(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));

// These two routes are for retrieving HTML files for display in the browser

app.get('/', function(request, response) {
  response.sendFile('index.html', {root: '.'});
});

app.get('/new', function(request, response) {
  response.sendFile('new.html', {root: '.'});
});

// Routes for making API calls to enact CRUD operations on our database

app.get('/articles', function(request, response) {
  // REVIEW: This query will join the data together from our tables
  // TODO: Write a SQL query which joins all data from articles and authors tables on the author_id value of each
  client.query(`SELECT *
              FROM articles
              INNER JOIN authors
                ON authors.author_id = articles.author_id;`)
  .then(function(result) {
    response.send(result.rows);
  })
  .catch(function(err) {
    console.error(err)
  });
});

app.post('/articles', function(request, response) {
  client.query(
  // TODO: Write a SQL query to insert a new ***author***, ON CONFLICT DO NOTHING
  // TODO: Add author and "authorUrl" as data for the SQL query to interpolate
    `INSERT INTO authors (author, "authorUrl")
      VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
    [request.body.author,
      request.body.authorUrl]
  )
  .then(function() {
    // TODO: Write a SQL query to insert a new ***article***, using a sub-query to retrieve the author_id from the authors table
    // TODO: Add the required values from the request as data for the SQL query to interpolate
    client.query(
      `INSERT INTO articles(author_id, title, category, "publishedOn", body)
      SELECT author_id, $1, $2, $3, $4
      FROM authors
      WHERE author=$5;`,
      [request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body,
        request.body.author]
    )
  })
  .then(function() {
    response.send('Insert complete')
  })
  .catch(function(err) {
    console.error(err)
  });
});

app.put('/articles/:id', function(request, response) {
  client.query(
  // TODO: Write a SQL query to update an ***author*** record
  // TODO: Add the required values from the request as data for the SQL query to interpolate
    `UPDATE authors
    SET author=$1, "authorUrl"=$2 WHERE author_id=$3`,
    [request.body.author,
      request.body.authorUrl,
      request.body.author_id]
  )
  .then(function() {
    // TODO: Write a SQL query to update an **article*** record
    // TODO: Add the required values from the request as data for the SQL query to interpolate
    client.query(
      `UPDATE articles
      SET title=$1, category=$2, "publishedOn"=$3, body=$4
    WHERE article_id=$5`,
      [request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body,
        request.params.id]
    )
  })
  .then(function() {
    response.send('Update complete');
  })
  .catch(function(err) {
    console.error(err);
  })
});

app.delete('/articles/:id', function(request, response) {
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
  .then(function() {
    response.send('Delete complete');
  })
  .catch(function(err) {
    console.error(err)
  });
});

app.delete('/articles', function(request, response) {
  client.query('DELETE FROM articles')
  .then(function() {
    response.send('Delete complete');
  })
  .catch(function(err) {
    console.error(err)
  });
});

loadDB();

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADERS ** ////////
////////////////////////////////////////
// REVIEW: This helper function will load authors into the DB if the DB is empty
function loadAuthors() {
  fs.readFile('./public/data/hackerIpsum.json', function(err, fd) {
    JSON.parse(fd.toString()).forEach(function(ele) {
      client.query(
        'INSERT INTO authors(author, "authorUrl") VALUES($1, $2) ON CONFLICT DO NOTHING',
        [ele.author, ele.authorUrl]
      )
    })
  })
}

// REVIEW: This helper function will load articles into the DB if the DB is empty
function loadArticles() {
  client.query('SELECT COUNT(*) FROM articles')
  .then(function(result) {
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', function(err, fd) {
        JSON.parse(fd.toString()).forEach(function(ele) {
          client.query(`
            INSERT INTO
            articles(author_id, title, category, "publishedOn", body)
            SELECT author_id, $1, $2, $3, $4
            FROM authors
            WHERE author=$5;
          `,
            [ele.title, ele.category, ele.publishedOn, ele.body, ele.author]
          )
        })
      })
    }
  })
}

// REVIEW: Below are two queries, wrapped in the loadDB() function,
// which create separate tables in our DB, and create a
// relationship between the authors and articles tables.
// THEN they load their respective data from our JSON file.
function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    authors (
      author_id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      "authorUrl" VARCHAR (255)
    );`
  )
  .then(function(data) {
    loadAuthors(data);
  })
  .catch(function(err) {
    console.error(err)
  });

  client.query(`
    CREATE TABLE IF NOT EXISTS
    articles (
      article_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL REFERENCES authors(author_id),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL
    );`
  )
  .then(function(data) {
    loadArticles(data);
  })
  .catch(function(err) {
    console.error(err)
  });
}
