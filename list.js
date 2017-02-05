const Harvest = require('harvest');
const moment = require('moment');

const formatDuration = duration => {
  const m = moment.duration(duration, 'hours');
  const min = m.minutes() < 10 ? '0' + m.minutes() : m.minutes();
  return `${m.hours()}:${min}`;
};

const durationSum = entries => entries.reduce((p, e) => p + e.hours, 0.0);

const logProjectsAndTasks = projects => {
  projects.forEach(p => {
    console.log(p.name);
    p.tasks.forEach(t => console.log(`  ${t.name}`));
  });
};

const logEntries = entries => {
  entries.forEach(e => {
    let notes = e.notes ? `${e.notes}` : '';
    console.log(`${formatDuration(e.hours)} | ${e.project} | ${e.task} | ${notes}`);
  });
};

const logDays = days => {
  days.forEach(d => {
    console.log('\n' +  d.for_day);
    logEntries(d.day_entries);
  })
};

exports.logDays = logDays;
exports.logEntries = logEntries;

const printList = () => {
};

exports.projects = () => {
  return require('./config').then(conf => {
    const harvest = new Harvest({
      subdomain: conf.subdomain,
      email: conf.username,
      password: conf.password
    });

    const Time = harvest.TimeTracking;
    return new Promise(res => {
      Time.daily({}, (err, data) => {
        if (err) {
          console.log(err);
          rej(err);
        }
        res(data.projects);
      });
    });
  });
};
