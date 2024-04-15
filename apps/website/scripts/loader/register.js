import { register } from 'node:module';

register('./hooks.js', import.meta.url);
process.env.SCRIPTS = 'true';
