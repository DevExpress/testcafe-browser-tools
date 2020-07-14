const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const EXIT_CODES = require('../../lib/exit-codes');
const errors = require('../../lib/errors');

describe('find-window', async () => {
    it('Should raise an error if a display was not found', async () => {
        const findWindowMock = proxyquire('../../lib/api/find-window', {
            '../utils/exec': {
                async execFile () {
                    throw new errors.NativeBinaryHasFailedError({
                        binary:   '/usr/bin/browser',
                        exitCode: EXIT_CODES.DISPLAY_NOT_FOUND
                    });
                }
            }
        });

        try {
            await findWindowMock.default('window-title');

            throw new Error('Promise rejection expected');
        }
        catch (err) {
            expect(err instanceof errors.UnableToOpenDisplayError).to.be.true;
            expect(err.code).eql('E006');
            expect(err.message).eql('The /usr/bin/browser process cannot open the display.');
        }
    });
});
