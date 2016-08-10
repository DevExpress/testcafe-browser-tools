var expect         = require('chai').expect;
var OS             = require('os-family');


describe('[API] open', function () {
    it('Should raise an error if browser path is not specified', function () {
        var browserInfo = {
            path: ''
        };

        return browserNatives
            .open(browserInfo)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Unable to run the browser. The browser path or command template is not specified.');
            });
    });

    it('Should raise an error if the file at browser.path does not exist.', function () {
        var browserInfo = {
            path: './non-existent-browser.exe'
        };

        return browserNatives
            .open(browserInfo)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Unable to run the browser. The file at ./non-existent-browser.exe' +
                                        ' does not exist or is not executable.');
            });
    });

    if (OS.win) {
        it('Should not raise an error if winOpenCmdTemplate is defined and browser path is not specified', function () {
            var browserInfo = {
                path:               '',
                winOpenCmdTemplate: 'echo test'
            };

            return browserNatives
                .open(browserInfo);
        });
    }
});
