var playground     = require('../playground');
var browserNatives = require('../../');

before(function () {
    this.timeout(0);

    process.stdout.write('init tests\n');

    global.browserNatives      = browserNatives;
    global.waitForBrowserOpen  = playground.waitForBrowserOpen;
    global.waitForBrowserClose = playground.waitForBrowserClose;

    return playground
        .start({ silent: true })
        .then(function () {
            global.browsers = playground.browsers;
        });
});

after(function () {
    this.timeout(0);

    process.stdout.write('cleanup tests\n');

    delete global.browserNatives;
    delete global.browsers;

    return playground.stop();
});
