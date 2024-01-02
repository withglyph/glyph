import net from 'node:net';
import { handle } from './handler';

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    handle(data)
      .then((data) => {
        if (data) {
          socket.write(data, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });
});

server.listen(2266, '0.0.0.0', () => {
  console.log(`Server started on port 2266`);
});
