const argv = require('yargs').argv;
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const mongo = require('mongodb').MongoClient;
// const path = require('path');

let db = null;

const mostSecureUrl = 'mongodb://heroku_9ntks6wl:48d9flnlndmqsqdccqbfp2goko@ds123084.mlab.com:23084/heroku_9ntks6wl';

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongo.connect(mostSecureUrl, (err, database) => {
  if (err) { console.log('Error connecting to database!!'); }
  db = database;
});

app.post('/auth/login', (request, response) => {
  console.log('Processing auth request....');
  console.log('request: ', request.body);
  response.json({
    data: 'Hola!!'
  });
});

app.get('/', (request, response) => {
  console.log('got / request');
  response.send('hello');
});

app.set('port', process.env.PORT || argv.port || 8080);

app.listen(app.get('port'), () => {
  console.log(`server listening on port : ${app.get('port')}`);
});

const shutdown = () => {
  console.log('Killing the server...');
  if (db) {
    console.log('Closing connection with database...');
    db.close();
  }
};

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);
