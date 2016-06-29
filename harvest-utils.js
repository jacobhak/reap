#!/usr/bin/env node

const program = require('commander');
const conf = require('./config');
const harvest = require('./harvest');
const list = require('./list');

const confThenExec = (f, args) => conf.then(c => f.apply(this, [c].concat(args)));

program
  .command('list [day]')
  .alias('l')
  .description('list tracked time for a specific day')
  .action(day => {
    confThenExec(harvest.getEntriesForDate, [day])
      .then(entries => list.logEntries(entries.day_entries));
  });

program.parse(process.argv);
