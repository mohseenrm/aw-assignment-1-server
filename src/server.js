import { generateLoginEvent } from './utils';

const argv = require('yargs').argv;
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const mongo = require('mongodb').MongoClient;


let db = null;
let server = null;

const mostSecureUrl = 'mongodb://heroku_9ntks6wl:48d9flnlndmqsqdccqbfp2goko@ds123084.mlab.com:23084/heroku_9ntks6wl';

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongo.connect(mostSecureUrl, (err, database) => {
  if (err) { console.log('Error connecting to database!!'); }
  db = database;
});

app.post('/auth/login', (request, response) => {
  console.log('Processing auth request....');
  // console.log('request: ', request.body);

  const query = {
    username: request.body.username,
    password: request.body.password
  };
  if (db) {
    db.collection('users').find(query).toArray((err, items) => {
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

    const event = generateLoginEvent();

    db.collection('history').updateOne(
      {
        username: query.username
      },
      {
        $push: {
          activity: event
        }
      },
      (error, result) => {
        if (error) {
          console.warn('Error updating history to database: ', error);
        } else {
          console.info('User history updated: ', result);
        }
      }
    );
  } else {
    response.json({
      auth: false
    });
  }
});

app.post('/auth/create', (request, response) => {
  if (db) {
    const newUser = {
      username: request.body.username,
      password: request.body.password
    };
    // add user to user collection
    db.collection('users').insertOne(
      newUser,
      (error, result) => {
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
      }
    );
    // add user to history collection
    db.collection('history').insertOne(
      {
        username: newUser.username
      },
      (error, result) => {
        if (error) {
          console.warn('Could not create new user: ', newUser.username);
        } else {
          console.info('Update History result: ', result);
        }
      }
    );
  } else {
    response.json({
      newAccount: false
    });
  }
});

app.post('/update/history', (request, response) => {
  console.log('Processing update history request...');
  if (db) {
    console.info('Update History: ', request.body);

    db.collection('history').updateOne(
      {
        username: request.body.username
      },
      {
        $push: {
          events: { $each: request.body.events }
        }
      },
      (error, result) => {
        if (error) {
          console.warn('Error updating history to database: ', error);
        } else {
          console.info('User history updated: ', result);
        }
      }
    );

    response.json({
      updateHistory: true
    });
  } else {
    response.json({
      updateHistory: false
    });
  }
});

/* db.collection('history').find({
  username: request.body.username,
  events: {
    className: { $in: cssClasses }
  }
}) */

app.post('/get/history', (request, response) => {
  console.log('Processing get history request...');
  if (db) {
    db.collection('history').find({
      username: request.body.username
    }).toArray((err, items) => {
      console.log('Items: ', items);
      // found history
      if (items.length !== 0) {
        response.json({
          getHistory: true,
          events: items
        });
      } else {
        response.json({
          getHistory: false
        });
      }
    });
  }
});

app.post('/get/stats', (request, response) => {
  console.log('Processing get stats request...');
  if (db) {
    db.collection('history').find({
      events: { $exists: true }
    }).toArray((err, items) => {
      // eslint-disable-next-line
      let stats = {
        global: {
          pages: 0,
          bounties: 0,
          questions: 0,
          tags: 0,
          votes: 0,
        },
        user: {
          pages: 0,
          bounties: 0,
          questions: 0,
          tags: 0,
          votes: 0,
        }
      };
      items.forEach((userData) => {
        if (userData.username === request.body.username) {
          userData.events.forEach((event) => {
            switch (event.className) {
              case 'question-hyperlink':
                stats.user.questions += 1;
                break;
              case 'page-numbers':
                stats.user.pages += 1;
                break;
              case 'bounties-tab':
                stats.user.bounties += 1;
                break;
              case 'post-tag':
                stats.user.tags += 1;
                break;
              case 'vote-up-off':
                stats.user.votes += 1;
                break;
              default:
                break;
            }
          });
        }
        userData.events.forEach((event) => {
          switch (event.className) {
            case 'question-hyperlink':
              stats.global.questions += 1;
              break;
            case 'page-numbers':
              stats.global.pages += 1;
              break;
            case 'bounties-tab':
              stats.global.bounties += 1;
              break;
            case 'post-tag':
              stats.global.tags += 1;
              break;
            case 'vote-up-off':
              stats.global.votes += 1;
              break;
            default:
              break;
          }
        });
      });
      // found history
      if (items.length !== 0) {
        response.json({
          getStats: true,
          stats,
        });
      } else {
        response.json({
          getStats: false
        });
      }
    });
  }
});

app.get('/', (request, response) => {
  console.log('got / request');
  response.send('hello');
});

app.set('port', process.env.PORT || argv.port || 8080);

server = app.listen(app.get('port'), () => {
  console.log(`server listening on port : ${app.get('port')}`);
});

const shutdown = () => {
  console.info('Killing the server...');
  if (db) {
    console.info('Closing connection with database...');
    db.close();
  }
  server.close(() => {
    console.info('Shutting down server...');
    process.exit();
  });
};

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);
