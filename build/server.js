'use strict';

var argv = require('yargs').argv;
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
// const path = require('path');

var app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/auth', function (request, response) {
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