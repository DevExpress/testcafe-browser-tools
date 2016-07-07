var isMac    = require('os-family').mac;
var execSync = require('child_process').execSync;

if (!isMac)
    return;

execSync('chmod +x ./bin/mac/screenshot');

process.stdout.write('File permissions fixed\n');
