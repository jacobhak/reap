#!/usr/bin/env node

const program = require('commander');
const conf = require('./config');
const readConfig = conf.readConfig;
const harvest = require('./harvest');
const list = require('./list');

const confThenExec = (f, args) => readConfig()
      .then(c => f.apply(this, [c].concat(args)));

program
  .command('list [day]')
  .alias('l')
  .description('list tracked time for a specific day')
  .action(day => {
    confThenExec(harvest.getEntriesForDate, [day])
      .then(entries => list.logEntries(entries.day_entries));
  });

program
  .command('config')
  .alias('c')
  .description('configure the harvest account to be used')
  .action(conf.promptForConfig);

program.parse(process.argv);
