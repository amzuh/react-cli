#!/usr/bin/env node

require = require('esm')(module /*, options*/); // This allows us to use imports
require('../src/cli').cli(process.argv);