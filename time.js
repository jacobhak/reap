const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const {dropLast} = require('ramda');

const currentMonday = moment().startOf('isoweek');
const currentSunday = moment().endOf('isoweek');
const lastMonday = moment(currentMonday).subtract(1, 'week');
const lastSunday = moment(currentSunday).subtract(1, 'week');
const nextMonday = moment(currentMonday).add(1, 'week');
const nextSunday = moment(currentSunday).add(1, 'week');

const rangeArray = (a, b) => Array.from(moment.range(a, b).by('day'));
const weekDays = dropLast(2);

const currentWeek = rangeArray(currentMonday, currentSunday);
const lastWeek = rangeArray(lastMonday, lastSunday);
const nextWeek = rangeArray(nextMonday, nextSunday);

const currentWeekdays = weekDays(currentWeek);
const lastWeekdays = weekDays(lastWeek);
const nextWeekdays = weekDays(nextWeek);

const lastSaturday = moment(lastMonday).subtract(2, 'days');
const currentFriday = moment(currentSunday).subtract(2, 'days');

const hWeek = rangeArray(lastSaturday, currentFriday);

module.exports.parseDate = date => {
  const mapping = {
    'today': [moment()],
    'week': currentWeek,
    'thisweek': currentWeek,
    'currentweek': currentWeek,
    'lastweek': lastWeek,
    'nextweek': nextWeek,
    'weekdays': currentWeekdays,
    'currentweekdays': currentWeekdays,
    'lastweekdays': lastWeekdays,
    'nextweekdays': nextWeekdays,
    'hweek': hWeek
  };
  
  return mapping[date.toLowerCase()] || [moment(date)];
};

