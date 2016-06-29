const fetch = require('node-fetch');
const conf = require('./config');
const moment = require('moment');
require('moment-range');

const request = (config, url, method, body) => {
  const base64 = new Buffer(config.username + ':' + config.password).toString('base64');
  const auth = `Basic ${base64}`;
  const options = {
    method: method,
    body: JSON.stringify(body),
    headers: {
      Authorization: auth,
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  return fetch(url, options)
    .catch(e => console.log(e));
};

const get = (config, url) => request(config, url, 'GET').then(r => r.json());
const post = (config, url, body) => request(config, url, 'POST', body)
      .then(r => r.json());

const del = (config, entryId) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/delete/${entryId}`;
  return request(config, url, 'DELETE');
};

const getEntriesForDate = (config, date) => {
  const dateMoment = moment(date);
  const dayOfYear = dateMoment.format('DDD');
  const year = dateMoment.format('YYYY');
  const url = `https://${config.subdomain}.harvestapp.com/daily/${dayOfYear}/${year}?slim=1`;
  return get(config, url);
};

const getProjects = config => {
  const url = `https://${config.subdomain}.harvestapp.com/daily`;
  return get(config, url).then(r => r.projects);
};

const getEntriesForDateRange = (config, start, end) => {
  const range = moment.range(moment(start), moment(end)).toArray('days');
  return Promise.all(range.map(d => getEntriesForDate(config, d)));
};

const createEntry = (config, project, task, date, notes, hours) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/add`;
  const body = {
    project_id: project,
    task_id: task,
    spent_on: date,
    hours: hours,
    notes: notes
  };
  return post(config, url, body);
};

const update = (config, entryId, notes, hours) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/update/${entryId}`;
  return post(config, url, {
    notes: notes,
    hours: hours
  });
};

const toggle = (config, entryId) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/timer/${entryId}`;
  return get(config, url);
};

// conf.then(c => {
//   getEntriesForDate(c, '2016-06-29')
//     .then(entries => console.log(entries));
// });
// conf.then(c => {
//   getEntriesForDateRange(c, '2016-06-27', '2016-06-28')
//     .then(e => console.log(e));
// });
// conf.then(c => {
//   getProjects(c)
//     .then(p => console.log(JSON.stringify(p)));
// });

// conf.then(c => {
//   createEntry(c, 2598666, 1627003, moment().format('YYYY-MM-DD'), 'testing', 0.5)
//     .then(r => update(c, r.id, undefined, 1))
//     .then(r => del(c, r.id))
//     .then(r => console.log(r));
// });

//conf.then(c => del(c, 481446467)).then(r => console.log(r.statusText));

const harvest = {
  update: update,
  toggle: toggle,
  createEntry: createEntry,
  getEntriesForDate: getEntriesForDate,
  getEntriesForDateRange: getEntriesForDateRange,
  del: del,
  getProjects: getProjects
};
module.exports = harvest;
