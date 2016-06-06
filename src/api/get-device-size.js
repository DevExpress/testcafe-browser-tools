import { readSync } from 'read-file-relative';


const DEVICE_DATABASE = JSON.parse(readSync('../../data/devices.json'));

/** Gets the viewport size for the specified device.
 * @function
 * @name getViewportSize
 * @param {string} deviceName - Specifies the name of the target device. Use values from the Device Name column of [this table]{@link http://viewportsizes.com/}.
 */
export default function (deviceName) {
    deviceName = deviceName.toLowerCase().replace(/\s+/g, '');

    return DEVICE_DATABASE[deviceName];
}
