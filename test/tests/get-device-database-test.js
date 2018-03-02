var assert       = require('chai').assert;
var browserTools = require('../../lib/index');
var viewports    = require('viewportsizes');

describe('get-device-database', function () {
    it('Should return the same device list as from the viewportsizes', function () {
        const deviceDatabase     = browserTools.getDeviceDatabase();
        const checkedViewports   = {};

        return viewports
            .list()
            .reverse()
            .forEach(viewport => {
                if (viewport.size.width && viewport.size.height && !checkedViewports[viewport.name]) {
                    const key = viewport.name.toLowerCase().replace(/\s+/g, '');

                    assert.isOk(deviceDatabase[key], viewport.name);
                    assert.equal(deviceDatabase[key].portraitWidth, viewport.size.width, viewport.name + ' width');
                    assert.equal(deviceDatabase[key].landscapeWidth, viewport.size.height, viewport.name + ' height');

                    checkedViewports[viewport.name] = true;
                }
            });
    });
});
