const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  // default name until client sets one
  socket.data.name = `User-${socket.id.slice(0,4)}`;

  socket.on('join', (name) => {
    if (typeof name === 'string' && name.trim()) {
      socket.data.name = name.trim();
    }
    io.emit('system', `${socket.data.name} joined`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      id: socket.id,
      name: socket.data.name,
      msg,
      ts: Date.now()
    });
  });

  socket.on('disconnect', () => {
    io.emit('system', `${socket.data.name} left`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
