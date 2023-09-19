#!/usr/bin/env node

import { glitch } from '../dist/cli.js';

const code = await glitch();
process.exit(code);
