const tar = require('keytar');
console.log(tar.addPassword('reap-harvest', 'test-account', 'blob'));
console.log(tar.getPassword('reap-harvest', 'test-account'));
