var expect         = require('chai').expect;
var browserNatives = require('../../lib/index');
var messages       = require('../../lib/messages');

describe('open', function () {
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
                expect(err.message).eql(messages.getText(messages.MESSAGES.browserPathNotSet));
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
                expect(err.message).eql(messages.getText(messages.MESSAGES.unableToRunBrowser, browserInfo.path));
            });

        open
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('Should not raise an error if winOpenCmdTemplate is defined and browser path is not specified', function (done) {
        var browserInfo = {
            path:               '',
            winOpenCmdTemplate: 'echo test'
        };

        var open = browserNatives
            .open(browserInfo)
            .catch(function () {
                throw new Error('Promise resolution expected');
            });

        open
            .then(function () {
                done();
            })
            .catch(done);
    });
});
