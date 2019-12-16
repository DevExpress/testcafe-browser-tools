const { expect }   = require('chai');
const browserTools = require('../../lib/index');
const devices      = require('../../data/devices');


describe('get-devices-viewport-data', function () {
    it('Should return the same device list as from the devices database', function () {
        const viewportData = browserTools.getDevicesViewportData();

        return Object.values(devices)
            .forEach(device => {
                const key = device.name.toLowerCase().replace(/\s+/g, '');

                expect(viewportData).have.property(key);
                expect(viewportData[key].name).equal(device.name);
                expect(viewportData[key].portraitWidth).equal(device.portraitWidth);
                expect(viewportData[key].landscapeWidth).equal(device.landscapeWidth);
            });
    });
});
