const { expect }   = require('chai');
const browserTools = require('../../lib/index');
const DEVICES      = require('../../data/devices');


describe('get-devices-viewport-data', function () {
    it('Should return the same device list as from the devices database', function () {
        const viewportData = browserTools.getDevicesViewportData();

        expect(viewportData).deep.equal(DEVICES);
    });
});
