import net from 'node:net';
import { handle } from './handler';

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    handle(data);
  });
});

server.listen(2266, '0.0.0.0', () => {
  console.log(`Server started on port 2266`);
});
