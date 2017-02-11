const moment = require('moment');
const calc = require('./calc');

const formatDuration = duration => {
  const m = moment.duration(duration, 'hours');
  return Math.floor(m.asHours()) + moment.utc(m.asMilliseconds()).format(':mm');
//  const min = m.minutes() < 10 ? '0' + m.minutes() : m.minutes();
//  return `${m.hours()}:${min}`;
};

const logProjectsAndTasks = projects => {
  projects.forEach(p => {
    console.log(p.name);
    p.tasks.forEach(t => console.log(`  ${t.name}`));
  });
};

const logEntries = (entries, showDate) => {
  entries.forEach(e => {
    const notes = e.notes ? ` | ${e.notes}` : '';
    const date = showDate ? `${e.spent_at} | ` : '';
    console.log(`${date}${formatDuration(e.hours)} | ${e.project} | ${e.task}${notes}`);
  });
};

const logDays = days => {
  days.forEach(d => {
    console.log(`${d.for_day} - ${formatDuration(calc.sumEntries(d.day_entries))}`);
    logEntries(d.day_entries);
    console.log('');
  });
  const sum = calc.sumDays(days);
  console.log(`Total hours tracked: ${formatDuration(sum)}`);
};

exports.logDays = logDays;
exports.logEntries = logEntries;


