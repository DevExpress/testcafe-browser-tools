var expect         = require('chai').expect;
var browserNatives = require('../../lib/index');

describe('Open()', function () {
    it('Should raise an error if browser path is not specified', function (done) {
        var browserInfo = {
            path: ''
        };

        var open = browserNatives
            .open(browserInfo)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Unable to run the browser. The browser path is not specified.');
            });

        open
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('Should raise an error if the file at browser.path does not exist.', function (done) {
        var browserInfo = {
            path: './non-existent-browser.exe'
        };

        var open = browserNatives
            .open(browserInfo)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Unable to run the browser. The file at ./non-existent-browser.exe does not exist or is not executable.');
            });

        open
            .then(function () {
                done();
            })
            .catch(done);
    });
});
