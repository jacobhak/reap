const inq = require('inquirer');
const moment = require('moment');
const harvest = require('./harvest');
const {defaultTo, __, map, find, propEq, merge, zip, reject} = require('ramda');
const calc = require('./calc');

const parseColonTime = time => {
  const split = time.split(':');
  if (split[0] === '') {
    return moment.duration(parseInt(split[1]), 'm');
  } else {
    return moment.duration(time);
  }
};

const parseDotTime = time => {
  const split = time.split('.');
  if (split[0] === '') {
    return parseFloat(`0.${split[1]}`);
  } else {
    return parseFloat(time);
  }
};

const parseTime = time => {
  if (time.match(/:/)) {
    return parseColonTime(time).as('hours');
  } else if (time.match(/\./)) {
    return parseDotTime(time);
  } else {
    return defaultTo(0.0, parseInt(time));
  }
};

const timeQuery = {
  'type': 'input',
  'name': 'time',
  'message': 'Time: ',
  'default': '0.0',
  'validate': v => {
    let valid = v.match(/:|\.|\d+/);
    if (valid) {
      return true;
    } else {
      return 'Time must contain : or . or a number';
    }
  }
};

const noteQuery = {
  'type': 'input',
  'name': 'note',
  'message': "Note: ",
  'default': ''
};

const taskQuery = (projects, project) => {
  return {
    'type': 'list',
    'name': 'task',
    'message': 'select task: ',
    'choices': map(t => {
      return {name: t.name, value: t.id};
    }, find(propEq('id', project), projects).tasks)
  };
};
const projectQuestion = projects => {
  return {
    'type': 'list',
    'name': 'project',
    'message': 'select project: ',
    'choices': projects.map(p => {
      return {name: p.name, value: p.id};
    })
  };
};

const queryEntry = (config, projects, skipTime) => {
  return inq.prompt(projectQuestion(projects))
    .then(a => inq.prompt(taskQuery(projects, a.project)).then(merge(a)))
    .then(answers => {
      if (skipTime) {
        return answers;
      }
      return inq.prompt(timeQuery).then(answer => {
        answer.time = parseTime(answer.time);
        Object.assign(answers, answer);
        return answers;
      });
    })
    .then(a => inq.prompt(noteQuery).then(merge(a)));
};

const fillToTarget = (config, target, dates, projects) => {
  return queryEntry(config, projects, true)
    .then(answers => {
      return harvest.getEntriesForDates(config, dates)
        .then(calc.fill(target))
        .then(fillTimes => {
          const pairsWithoutZeroFill = reject(([d, f]) => f === 0, zip(dates, fillTimes));
          return Promise.all(map(([day, fillTime]) => {
            return harvest.createEntry(config,
                                       answers.project,
                                       answers.task,
                                       day.format('YYYY-MM-DD'),
                                       fillTime,
                                       answers.note);
          }, pairsWithoutZeroFill));
        });
    });
};

module.exports.fillToTarget = fillToTarget;
module.exports.queryEntry = queryEntry;

module.exports.start = (config, projects, dateRange) => {
  return queryEntry(config, projects, false)
    .then(answers => {
      const partiallyAppliedCall = harvest.createEntry(config,
                                                       answers.project,
                                                       answers.task,
                                                       __,
                                                       answers.time,
                                                       answers.note);
      const formatAndApply = m => partiallyAppliedCall(m.format('YYYY-MM-DD'));
      return Promise.all(map(formatAndApply, dateRange));
    })
    .then(() => {
      console.log('started timer');
    })
    .catch(e => console.log(e));
};
