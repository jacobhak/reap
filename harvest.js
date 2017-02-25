const fetch = require('node-fetch');
const conf = require('./config');
const moment = require('moment');
require('moment-range');
const R = require('ramda');

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

const get = (config, url) => request(config, url, 'GET').then(r => r.json()).catch(e => console.log(e));
const post = (config, url, body) => request(config, url, 'POST', body)
      .then(r => r.json());

const del = R.curry((config, {id}) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/delete/${id}`;
  return request(config, url, 'DELETE');
});

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
  return getEntriesForDates(config, range);
};

const getEntriesForDates = (config, dates) => {
  return Promise.all(dates.map(d => getEntriesForDate(config, d)));
};

const createEntry = R.curry((config, project, task, date, hours, notes) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/add`;
  const body = {
    project_id: project,
    task_id: task,
    spent_at: date,
    hours: hours,
    notes: notes
  };
  return post(config, url, body);
});

const update = R.curry((config, {id, notes, hours}) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/update/${id}`;
  return post(config, url, {
    notes: notes,
    hours: hours
  });
});

const toggle = (config, entryId) => {
  const url = `https://${config.subdomain}.harvestapp.com/daily/timer/${entryId}`;
  return get(config, url);
};

const getUserId = (config) => {
  return get(config, `https://${config.subdomain}.harvestapp.com/account/who_am_i`).then(u => u.user.id);
};

const getEntriesForUserAndRange = R.curry((config, start, end) => {
  return getUserId(config)
    .then(id => {
      return get(config, `https://${config.subdomain}.harvestapp.com/people/${id}/entries?from=${start}&to=${end}`);
    });
});

const harvest = {
  update: update,
  toggle: toggle,
  createEntry: createEntry,
  getEntriesForDate: getEntriesForDate,
  getEntriesForDateRange: getEntriesForDateRange,
  getEntriesForDates: getEntriesForDates,
  getEntriesForUserAndRange: getEntriesForUserAndRange,
  del: del,
  getProjects: getProjects
};
module.exports = harvest;
