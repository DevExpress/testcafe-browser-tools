const expect  = require('chai').expect;
const aliases = require('../../lib/aliases');

describe('chrome video-autoplay execution', () => {
    it('Should contains specific autoplay flag', async () => {
        const chromeCmd = aliases.default.chrome.cmd;
        const flagArr   = chromeCmd.split(' ');

        expect(flagArr).contains('--autoplay-policy=no-user-gesture-required');
    });
});
