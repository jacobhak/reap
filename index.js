#!/usr/bin/env node

const program = require('commander');
const conf = require('./config');
const harvest = require('./harvest');
const list = require('./list');
const parseDate = require('./time').parseDate;
const start = require('./start');
const calc = require('./calc');
const history = require('./history');


const confThenExec = (f, args) => conf.readConfig().then(c => f.apply(this, [c].concat(args)));

// TODO: checkout chrono-node again.
program
  .command('list [day]')
  .description('list tracked time for a specific day')
  .alias('l')
  .action(day => {
    confThenExec(harvest.getEntriesForDates, [parseDate(day || 'today')])
      .then(entries => {
        list.logDays(entries);
      });
  });

// TODO: allow specification of project, task, date, time, note
program
  .command('start [dayOrWeek] [targetHours]')
  .description('start a timer, optionally for a range and filling up target hours')
  .alias('s')
  .action((range, target) => {
    confThenExec(config => {
      return harvest.getProjects(config)
        .then(projects => {
          if (target) {
            return start.fillToTarget(config, parseInt(target), parseDate(range || 'today'), projects);
          } else {
            return start.start(config, projects, parseDate(range || 'today'));
          }
        });
    });
  });

program
  .command('config')
  .alias('c')
  .description('configure the harvest account to be used')
  .action(conf.promptForConfig);

program
  .command('round [dayOrWeek] [roundToMinutes]')
  .alias('r')
  .description('round all entries within a given date/range to the closest specified minutes')
  .action((date, closestMinutes) => {
    conf.readConfig().then(config => {
      harvest.getEntriesForDates(config, parseDate(date || 'today'))
        .then(days => {
          calc.roundDays(config, parseInt(closestMinutes || 15), days);
        });
    });
  });

program
  .command('diff [dayOrWeek] [targetHours]')
  .alias('d')
  .description('calculates the difference between logged time for a given date/range and a specified target hours')
  .action((date, targetHours) => {
    confThenExec(harvest.getEntriesForDates, [parseDate(date || 'week')])
      .then(days => {
        calc.difference(targetHours || 40, days);
      });
  });


// TODO: fill

// TODO: edit: edit/delete

// TODO: history, then allow to start from history
program
  .command('history')
  .alias('h')
  .description('caches history on file')
  .action(() => {
    confThenExec(history.storeHistory, []);
  });

// TODO: cache projects and tasks. Why?

program.parse(process.argv);
