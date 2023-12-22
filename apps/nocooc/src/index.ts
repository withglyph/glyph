import net from 'node:net';

const server = net.createServer((socket) => {
  const clientName = `${socket.remoteAddress}:${socket.remotePort}`;

  console.log(`Client connected: ${clientName}`);

  socket.on('data', (data) => {
    console.log(`${clientName} said: ${data}`);
  });

  socket.on('end', () => {
    console.log(`Client disconnected: ${clientName}`);
  });

  socket.on('error', (err) => {
    console.log(`Socket error: ${err}`);
  });
});

server.listen(2266, '0.0.0.0', () => {
  console.log(`Server started on port 2266`);
});
