'use strict';

var argv = require('yargs').argv;
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');

var mongo = require('mongodb').MongoClient;
// const path = require('path');

var db = null;
var server = null;

var mostSecureUrl = 'mongodb://heroku_9ntks6wl:48d9flnlndmqsqdccqbfp2goko@ds123084.mlab.com:23084/heroku_9ntks6wl';

var app = express();

app.use(bodyParser.json());
app.use(cors());

mongo.connect(mostSecureUrl, function (err, database) {
  if (err) {
    console.log('Error connecting to database!!');
  }
  db = database;
});

app.post('/auth/login', function (request, response) {
  console.log('Processing auth request....');
  console.log('request: ', request.body);

  var query = {
    username: request.body.username,
    password: request.body.password
  };
  if (db) {
    db.collection('users').find(query).toArray(function (err, items) {
      console.log('Items: ', items);
      // found user
      if (items.length !== 0) {
        response.json({
          auth: true,
          username: query.username
        });
      } else {
        response.json({
          auth: false
        });
      }
    });
  } else {
    response.json({
      auth: false
    });
  }
});

app.post('/auth/create', function (request, response) {
  if (db) {
    var newUser = {
      username: request.body.username,
      password: request.body.password
    };
    // add user to user collection
    db.collection('users').insertOne(newUser, function (error, result) {
      if (error) {
        console.warn('Could not create new user: ', newUser.username);
        response.json({
          newAccount: false
        });
      } else {
        response.json({
          newAccount: true,
          username: result.ops[0].username
        });
      }
    });
    // add user to history collection
    db.collection('history').insertOne({
      username: newUser.username
    }, function (error, result) {
      if (error) {
        console.warn('Could not create new user: ', newUser.username);
      } else {
        console.info('Update History result: ', result);
      }
    });
  } else {
    response.json({
      newAccount: false
    });
  }
});

app.post('/update/history', function (request, response) {
  console.log('Processing update history request...');
  if (db) {
    console.info('Update History: ', request.body);

    db.collection('history').updateOne({
      username: request.body.username
    }, {
      $push: {
        events: request.body.events
      }
    }, function (error, result) {
      if (error) {
        console.warn('Error updating history to database: ', error);
      } else {
        console.info('User history updated: ', result);
      }
    });

    response.json({
      updateHistory: true
    });
  } else {
    response.json({
      updateHistory: false
    });
  }
});

app.get('/', function (request, response) {
  console.log('got / request');
  response.send('hello');
});

app.set('port', process.env.PORT || argv.port || 8080);

server = app.listen(app.get('port'), function () {
  console.log('server listening on port : ' + app.get('port'));
});

var shutdown = function shutdown() {
  console.info('Killing the server...');
  if (db) {
    console.info('Closing connection with database...');
    db.close();
  }
  server.close(function () {
    console.info('Shutting down server...');
    process.exit();
  });
};

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);