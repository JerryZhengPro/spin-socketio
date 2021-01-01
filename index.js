const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
const bodyParser = require('body-parser');

const users = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/item-bought', (request, response) => {
    response.send();
    for (const user of users) {
      user.emit('item bought', Number(request.body.marketID), request.body.seller, Number(request.body.price));
    }
});

app.post('/item-listed', (request, response) => {
    response.send();
    for (const user of users) {
      user.emit('item listed', request.body);
    }
});

app.post('/item-unboxed', (request, response) => {
    response.send();
    for (const user of users) {
      user.emit('item unboxed', request.body.item, request.body.rarity, request.body.unboxer);
    }
});

io.on('connection', (socket) => {
  users.push(socket);
  console.log('A user has connected to the server!');

  socket.on('disconnect', () => {
    console.log('A user has disconnected from the server!');
    for (i = 0; i < users.length; i++) {
      if (users[i].id === socket.id) {
        users.splice(i, 1); 
      }
    }

  });
});

server.listen(3000);
