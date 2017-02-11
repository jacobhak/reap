const {compose, flatten, map, prop, reject, isNil,
       filter, propEq, isEmpty, curry, assoc, reduce,
       add, difference, subtract, max} = require('ramda');
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
    return a.sure === 'y' ? true : false;
  });
};

const entriesFromDays = compose(flatten, map(prop('day_entries')));

const sumEntries = compose(reduce(add, 0), map(prop('hours')));
const sumDays = compose(sumEntries, entriesFromDays);

const diff = (targetHours, days) => {
  const sum = sumDays(days);
  console.log(sum - targetHours);
};

const fill = curry((target, days) => {
  const sumDay = compose(sumEntries, prop('day_entries'));
  return map(compose(max(0), subtract(target)), map(sumDay, days));
});

const roundDays = (config, roundTo, days) => {
  const roundToH = minutesToHours(roundTo);
  const entries = entriesFromDays(days);
  const roundedEntries = reject(isNil, roundEntries(roundToH, entries));
  const entriesToDelete = filter(propEq('hours', 0.0), roundedEntries);
  const entriesToUpdate = difference(roundedEntries, entriesToDelete);

  if (!isEmpty(entriesToDelete) || !isEmpty(entriesToUpdate)) {
    console.log('Will delete');
    list.logEntries(entriesToDelete, true);
    console.log('\nWill update');
    list.logEntries(entriesToUpdate, true);
    isUserSure().then(sure => {
      if (sure) {
        console.log('updating harvest...');
        Promise.all([
          Promise.all(map(harvest.update(config), entriesToUpdate)),
          Promise.all(map(harvest.del(config), entriesToDelete))
        ]).then(() => console.log('updated'));
      } else {
        console.log('aborting');
      }
    });
  } else {
    console.log('No entries updated');
  }
};

const minutesToHours = min => 1 / moment.duration(min, 'm').asHours();

const roundEntries = curry(
  (roundTo, entries) => map(roundEntry(roundTo), entries));

const round = (roundTo, hours) => Math.round(hours * roundTo) / roundTo;

const roundEntry = curry((roundTo, entry) => {
  const newHours = round(roundTo, entry.hours);
  const isChanged = entry.hours !== newHours;
  return isChanged ? assoc('hours', newHours, entry) : null;
});

module.exports = {
  roundDays: roundDays,
  difference: diff,
  sumDays: sumDays,
  sumEntries: sumEntries,
  fill: fill
};
