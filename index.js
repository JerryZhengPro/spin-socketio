const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://spin.jerrytq.com'),
    methods: ['GET', 'POST']
  }
});

const authenticate = (req, res, next) => {
  if (req.type !== 'POST') {
    res.status(400);
    res.send();
  }
  if (req.header('Authorization') !== process.env.SOCKET_KEY) {
    res.status(401);
    res.send();
  } else {
    next();
  }
}
app.use(authenticate);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = [];

app.post('/item-bought', (request, response) => {
  for (const user of users) {
    user.emit('item bought', Number(request.body.marketID), request.body.seller, Number(request.body.price));
  }
  response.send();
});

app.post('/item-listed', (request, response) => {
  for (const user of users) {
    user.emit('item listed', request.body);
  }
  response.send();
});

app.post('/item-unboxed', (request, response) => {
  for (const user of users) {
    user.emit('item unboxed', request.body.itemName, request.body.rarity, request.body.unboxer);
  }
  response.send();
});

io.on('connection', (socket) => {
  users.push(socket);
  console.log('A user has connected to the server!');

  socket.on('disconnect', () => {
    console.log('A user has disconnected from the server!');
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === socket.id) {
        users.splice(i, 1);
      }
    }

  });
});

server.listen(process.env.PORT || 3000);
