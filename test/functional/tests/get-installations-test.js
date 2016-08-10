var expect  = require('chai').expect;
var ALIASES = require('../config').ALIASES;


describe('[API] getInstallations', function () {
    it('Should list available browsers', function () {
        return browserNatives
            .getInstallations()
            .then(function (installations) {
                var foundAliases = Object.keys(installations);

                ALIASES.forEach(function (alias) {
                    expect(foundAliases).to.contain(alias);
                });
            });
    });
});
