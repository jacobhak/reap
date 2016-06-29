const inquirer = require('inquirer');
const tar = require('keytar');
const fs = require('mz/fs');
const path = require('path');

const dir = path.join(process.env.HOME, '.reap');
const file = path.join(dir, 'config.json');

const promptForConfig = () => {
  const questions = [
    {
      'type': 'input',
      'name': 'subdomain',
      'message': 'subdomain: '
    },
    {
      'type': 'input',
      'name': 'username',
      'message': 'username: '
    },
    {
      'type': 'password',
      'name': 'password',
      'message': 'password: '
    }
  ];

  return inquirer.prompt(questions);
};

const writeConfig = (answers) => {
  const write = () => {
    return fs.writeFile(file, JSON.stringify({
      'subdomain': answers.subdomain,
      'username': answers.username
    }, 2)).then(() => {
      tar.replacePassword('harvest-utils', answers.username, answers.password);
      return answers;
    });
  };

  if (!fs.existsSync(dir)) {
    return fs.mkdir(dir).then(write);
  } else {
    return write();
  }
};

const readConfig = () => {
  return fs.readFile(file)
    .then(contents => {
      let c = JSON.parse(contents);
      return new Promise((res, rej) => {
        const pass = tar.getPassword('harvest-utils', c.username);
        if (!pass) {
          rej();
        } else {
          c.password = pass;
          res(c);
        }
      });
    })
    .catch(() => {
      console.log('No config found');
      return promptForConfig().then(writeConfig);
    });
};

exports.readConfig = readConfig;
exports.promptForConfig = promptForConfig;
