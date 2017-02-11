const R = require('ramda');
const moment = require('moment');
const list = require('./list');
const inq = require('inquirer');
const harvest = require('./harvest');

const isUserSure = () => {
  return inq.prompt({
    'type': 'list',
    'name': 'sure',
    'message': 'Are you sure?',
    'choices': ['y', 'n']
  }).then(a => {
    return a.sure === 'y' ? true : false
  });
}

const roundDays = (config, roundTo, days) => {
  const roundToH = minutesToHours(roundTo);
  const entries = R.flatten(R.map(R.prop('day_entries'), days));
  const roundedEntries = R.reject(R.isNil, roundEntries(roundToH, entries));
  const entriesToDelete = R.filter(R.propEq('hours', 0.0), roundedEntries);
  const entriesToUpdate = R.difference(roundedEntries, entriesToDelete);

  if (!R.isEmpty(entriesToDelete) || !R.isEmpty(entriesToUpdate)) {
    console.log('Will delete');
    list.logEntries(entriesToDelete, true);
    console.log('\nWill update');
    list.logEntries(entriesToUpdate, true);
    isUserSure().then(sure => {
      if (sure) {
        console.log('updating harvest...');
        Promise.all([
          Promise.all(R.map(harvest.update(config), entriesToUpdate)),
          Promise.all(R.map(harvest.del(config), entriesToDelete))
        ]).then(() => console.log('updated'))
      } else {
        console.log('aborting');
      }
    });
  } else {
    console.log('No entries updated');
  }
};

const minutesToHours = min => 1 / moment.duration(min, 'm').asHours();

const roundEntries = R.curry(
  (roundTo, entries) => R.map(roundEntry(roundTo), entries));

const round = (roundTo, hours) => Math.round(hours * roundTo) / roundTo;

const roundEntry = R.curry((roundTo, entry) => {
  const newHours = round(roundTo, entry.hours);
  const isChanged = entry.hours !== newHours;
  return isChanged? R.assoc('hours', newHours, entry) : null;
});

module.exports.roundDays = roundDays;
