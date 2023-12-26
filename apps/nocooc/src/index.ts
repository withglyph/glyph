import { run } from 'aws-lambda-ric';
import { handler } from './consumer';
import { startServer } from './relay';

if (process.env.MODE === 'relay') {
  startServer();
} else if (process.env.MODE === 'consumer') {
  await run(handler);
}
