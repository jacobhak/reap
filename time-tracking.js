const Harvest = require('harvest');

const harvest = () => {
  return require('./config').then(conf => {
    return new Harvest({
      subdomain: conf.subdomain,
      email: conf.username,
      password: conf.password
    });
  });
};

exports.startTimer = params => {
  return harvest().then(h => {
    const Time = h.TimeTracking;
    return new Promise(res => {
      Time.create(params, (err, data) => res(data));
    });
  });
};
