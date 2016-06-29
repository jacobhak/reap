const Harvest = require('harvest');
const moment = require('moment');

const formatDuration = duration => {
  const m = moment.duration(duration, 'hours');
  return `${m.hours()}:${m.minutes()}`;
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
    let notes = e.notes ? `, ${e.notes}` : '';
    console.log(`${formatDuration(e.hours)} ${e.project} - ${e.task}${notes}`);
  });
};

const printList = () => {
  require('./config').then(conf => {
    const harvest = new Harvest({
      subdomain: conf.subdomain,
      email: conf.username,
      password: conf.password
    });

    const Time = harvest.TimeTracking;
    Time.daily({}, (err, data) => {
      console.log(data);
      logProjectsAndTasks(data.projects);
      logEntries(data.day_entries);
      console.log(formatDuration(durationSum(data.day_entries)));
    });

  });
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
        res(data.projects);
      });
    });
  });
};
