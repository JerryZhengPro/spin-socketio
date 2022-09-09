const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://spin.jerrytq.com'),
    methods: ['GET', 'POST']
  }
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { timingSafeEqual } = require('crypto');

const compareSecrets = (a, b) => {
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
};

const authenticate = (req, res, next) => {
  if (compareSecrets(req.header('Authorization'), process.env.SOCKET_KEY)) {
    next();
  } else {
    res.status(401);
    res.send();
    return;
  }
};

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
