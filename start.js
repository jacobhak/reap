const inq = require('inquirer');
const list = require('./list');
const moment = require('moment');
const harvest = require('./harvest');

const task = (projects, project) => {
  const q = {
    'type': 'list',
    'name': 'task',
    'message': 'select task: ',
    'choices': projects.filter(p => p.id === project)[0].tasks.map(t => {
      return {name : t.name, value: t.id};
    })
  };
  return inq.prompt(q);
};

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
    return 0.0;
  }
};

const queryTimeAndNote = () => {
  const q = [
    {
      'type': 'input',
      'name': 'time',
      'message': 'Time: ',
      'default': '0.0',
      'validate': v => {
        let valid = v.match(/:|\./);
        if (valid) {
          return true;
        } else {
          return 'Time must contain : or .';
        }
      }
    },
    {
      'type': 'input',
      'name': 'note',
      'message': "Note: ",
      'default': ''
    }
  ];
  return inq.prompt(q);
};

module.exports = (config, projects, date) => {
  const projectQuestion = {
    'type': 'list',
    'name': 'project',
    'message': 'select project: ',
    'choices': projects.map(p => {
      return {name: p.name, value: p.id};
    })
  };

  return inq.prompt(projectQuestion)
    .then(answer => {
      return task(projects, answer.project).then(task => {
        console.log(`${answer.project} - ${task.task}`);
        return {project: answer.project, task: task.task};
      });
    })
    .then(answers => {
      return queryTimeAndNote().then(answer => {
        answer.time = parseTime(answer.time);
        Object.assign(answers, answer);
        return answers;
      });
    })
    .then(answers => {
      return harvest.createEntry(config,
                                 answers.project,
                                 answers.task,
                                 date || moment().format(),
                                 answers.time,
                                 answers.note);
    })
    .then(() => {
      console.log('started timer');
    })
    .catch(e => console.log(e));
};
