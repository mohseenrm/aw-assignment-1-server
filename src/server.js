const argv = require('yargs').argv;
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

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
