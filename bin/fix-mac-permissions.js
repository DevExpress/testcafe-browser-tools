var isMac    = require('os-family').mac;
var execSync = require('child_process').execSync;

if (!isMac)
    return;

execSync('chmod +x ./bin/mac/screenshot');
execSync('chmod +x ./bin/mac/generate-thumbnail');

process.stdout.write('File permissions fixed\n');
