'use strict';

var argv = require('yargs').argv;
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');

var mongo = require('mongodb').MongoClient;
// const path = require('path');

var db = null;

var mostSecureUrl = 'mongodb://heroku_9ntks6wl:48d9flnlndmqsqdccqbfp2goko@ds123084.mlab.com:23084/heroku_9ntks6wl';

var app = express();

app.use(cors());
app.use(bodyParser.json());

mongo.connect(mostSecureUrl, function (err, database) {
  if (err) {
    console.log('Error connecting to database!!');
  }
  db = database;
});

app.post('/auth/login', function (request, response) {
  console.log('Processing auth request....');
  console.log('request: ', request.body);
  response.json({
    data: 'Hola!!'
  });
});

app.get('/', function (request, response) {
  console.log('got / request');
  response.send('hello');
});

app.set('port', process.env.PORT || argv.port || 8080);

app.listen(app.get('port'), function () {
  console.log('server listening on port : ' + app.get('port'));
});

var shutdown = function shutdown() {
  console.log('Killing the server...');
  if (db) {
    console.log('Closing connection with database...');
    db.close();
  }
};

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);