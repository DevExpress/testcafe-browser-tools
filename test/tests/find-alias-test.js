const { expect } = require('chai');
const proxyquire = require('proxyquire');


const ALIASES = {
    'browser1': {
        nameRe: /browser1/,
        cmd:    '-a -b'
    },

    'browser2': {
        cmd: '-c -d'
    }
};

describe.only('[Utils] Find alias', () => {
    it('Should find a browser by partial matching', () => {
        const { default: findAlias } = proxyquire('../../lib/utils/find-alias', {
            '../aliases': { default: ALIASES }
        });

        const alias = findAlias('/path/to/browser1');

        expect(alias).deep.equal({ name: 'browser1', alias: ALIASES['browser1'] });
    });

    it('Should return undefined when no browser is found', () => {
        const { default: findAlias } = proxyquire('../../lib/utils/find-alias', {
            '../aliases': { default: ALIASES }
        });

        const alias = findAlias('/path/to/browser2');

        expect(alias).be.undefined;
    });
});
