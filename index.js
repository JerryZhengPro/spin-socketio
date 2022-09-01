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
  if (req.header('Authorization') !== process.env.SOCKET_KEY) {
    res.status(401);
    res.send();
    return;
  } else {
    next();
  }
}

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = new Map();

app.get('/', (_, response) => {
  response.send('Server is online!');
});

app.post('/item-bought', authenticate, (request, response) => {
  io.emit('item bought', Number(request.body.marketID), request.body.seller, Number(request.body.price));
  response.send();
});

app.post('/item-listed', authenticate, (request, response) => {
  io.emit('item listed', request.body);
  response.send();
});

app.post('/item-unboxed', authenticate, (request, response) => {
  io.emit('item unboxed', request.body.itemName, request.body.rarity, request.body.unboxer);
  response.send();
});

io.on('connection', (socket) => {
  users.set(socket.id, null);
  console.log('A user has connected to the server!');

  socket.on('disconnect', () => {
    console.log('A user has disconnected from the server!');
    users.delete(socket.id);
  });
});

server.listen(process.env.PORT || 3000);
