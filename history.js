const R = require('ramda');
const moment = require('moment');
const fs = require('mz/fs');
const path = require('path');

const harvest = require('./harvest');

const dir = path.join(process.env.HOME, '.reap');
const file = path.join(dir, 'history.json');


const interestingFields = entry => {
  return R.pick([
    'notes',
    'project_id',
    'task_id',
    'spent_at'
  ], entry.day_entry);
};

const groupByPTN = R.groupBy(e => `${e.project_id}.${e.task_id}.${e.notes}`);
const groupByPT = R.groupBy(e => `${e.project_id}.${e.task_id}`);
const groupByP = R.groupBy(e => `${e.project_id}`);


const sortBySpentAt = R.sort((a, b) => {
  return moment(a.spent_at).diff(moment(b.spent_at));
});

const score = (group) => {
  const timeScore = moment().diff(moment(group.last_spent_at));
  return timeScore * (1 / Math.pow(group.count, 2));
};

const compareScore = (a, b) => score(a) - score(b);

const groupedProperties = (groups) => {
  return R.values(R.mapObjIndexed((val, key) => {
    return {
      key: key,
      last_spent_at: R.head(sortBySpentAt(val)).spent_at,
      count: R.length(val),
      project_id: R.head(val).project_id,
      task_id: R.head(val).task_id,
      notes: R.head(val).notes
    };
  }, groups));
};

const addScore = R.map(g => R.assoc('score', score(g), g));

const storeHistory = config => {
  harvest.getEntriesForUserAndRange(config, '20170210', '20170225')
    .then(entries => {
      const mappedEntries = R.map(interestingFields, entries);
      const entriesWithNotes = R.reject(R.propEq('notes', ''), mappedEntries);
      const stats = groupedProperties(groupByPTN(entriesWithNotes));
      const statsWithScore = addScore(stats);
      const sortedByScore = R.sortBy(R.prop('score'), statsWithScore);
      return fs.writeFile(file, JSON.stringify(sortedByScore, undefined, 2));
    })
    .then(() => console.log('wrote history to file'));
};

module.exports = {
  storeHistory: storeHistory
}
