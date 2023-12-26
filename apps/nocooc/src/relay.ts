import net from 'node:net';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

export const startServer = () => {
  const sqs = new SQSClient();

  const server = net.createServer((socket) => {
    const clientName = `${socket.remoteAddress}:${socket.remotePort}`;

    console.log(`Client connected: ${clientName}`);

    socket.on('data', (data) => {
      sqs
        .send(
          new SendMessageCommand({
            QueueUrl: process.env.SQS_URL,
            MessageBody: data.toString('base64'),
          }),
        )
        .then((res) => console.log(`[SQS] Message ID: ${res.MessageId}`))
        .catch((err) => console.error(err));
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
};
