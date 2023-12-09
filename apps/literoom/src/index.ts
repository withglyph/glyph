import { run } from 'aws-lambda-ric';
import { handler } from './handler';

await run(handler);
