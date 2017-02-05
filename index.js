#!/usr/bin/env node

const program = require('commander');
const conf = require('./config');
const harvest = require('./harvest');
const list = require('./list');
const parseDate = require('./time').parseDate;
const start = require('./start');

const confThenExec = (f, args) => conf.readConfig().then(c => f.apply(this, [c].concat(args)));

// TODO: add week / last week etc. checkout chrono-node again.
program
  .command('list <day>')
  .description('list tracked time for a specific day')
  .alias('l')
  .action(day => {
    confThenExec(harvest.getEntriesForDates, [parseDate(day)])
      .then(entries => {
        list.logDays(entries)
      });
  });

// TODO: allow specification of project, task, date, time, note
program
  .command('start')
  .description('start a timer')
  .alias('s')
  .action(() => {
    confThenExec(config => {
      return harvest.getProjects(config)
        .then(projects => {
          return start(config, projects);
        });
    });
  });

program
  .command('config')
  .alias('c')
  .description('configure the harvest account to be used')
  .action(conf.promptForConfig);



// TODO: history, then allow to start from history

// TODO: cache projects and tasks



program.parse(process.argv);
