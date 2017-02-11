const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

const currentMonday = moment().startOf('isoweek');
const currentSunday = moment().endOf('isoweek');
const lastMonday = moment(currentMonday).subtract(1, 'week');
const lastSunday = moment(currentSunday).subtract(1, 'week');
const nextMonday = moment(currentMonday).add(1, 'week');
const nextSunday = moment(currentSunday).add(1, 'week');

const rangeArray = (a, b) => Array.from(moment.range(a, b).by('day'));

const currentWeek = rangeArray(currentMonday, currentSunday);
const lastWeek = rangeArray(lastMonday, lastSunday);
const nextWeek = rangeArray(nextMonday, nextSunday);

module.exports.parseDate = date => {
  const mapping = {
    'today': [moment()],
    'week': currentWeek,
    'thisweek': currentWeek,
    'currentweek': currentWeek,
    'lastweek': lastWeek,
    'nextweek': nextWeek
  };
  
  return mapping[date.toLowerCase()] || moment(date);
};

