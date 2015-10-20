var expect         = require('chai').expect;
var browserNatives = require('../../lib/index');

describe('getBrowserInfo', function () {
    it('Should raise an error if the browser ID is not an alias or file path', function (done) {
        browserNatives
            .getBrowserInfo('ffuuuuu')
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Unable to find the browser. "ffuuuuu" is not a browser alias or path to an executable file.');
            })
            .then(function () {
                done();
            })
            .catch(done);
    });
});
