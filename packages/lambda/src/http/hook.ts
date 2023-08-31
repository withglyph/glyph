import exitHook from 'exit-hook';

process.on('unhandledRejection', (reason, promise) => {
  console.error('UnhandledRejection:', promise, reason);
  throw reason;
});

process.on('uncaughtException', (error) => {
  console.error('UncaughtException:', error);
  process.exit(1);
});

exitHook((signal) => {
  console.log(`Exiting with signal: ${signal}`);
});
