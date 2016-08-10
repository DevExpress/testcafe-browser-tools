var expect  = require('chai').expect;
var ALIASES = require('../config').ALIASES;


describe('Complex tests', function () {
    describe('open/close', function () {
        var installations = null;

        this.timeout(60000);

        before(function () {
            return browserNatives
                .getInstallations()
                .then(function (inst) {
                    installations = inst;
                });
        });

        ALIASES.forEach(function (alias) {
            it('Should open browser ' + alias, function () {

                return browserNatives
                    .open(installations[alias], 'http://localhost:1334/test-page/' + alias)
                    .then(function () {
                        return waitForBrowserOpen(alias);
                    })
                    .then(function () {
                        expect(browsers[alias]).to.not.be.undefined;
                    });
            });

            it('Should close browser ' + alias, function () {
                return browserNatives
                    .close('browser-id:' + alias)
                    .then(function () {
                        return waitForBrowserClose(alias);
                    })
                    .then(function () {
                        expect(browsers[alias]).to.be.undefined;
                    });
            });
        });

    });
});
