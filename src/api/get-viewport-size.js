import { readSync } from 'read-file-relative';


const DEVICE_DATABASE = JSON.parse(readSync('../../data/devices.json'));

/** @typedef {Object} DeviceViewportSize
 * @description Defines the size of a device viewport.
 * @property {number} portraitWidth - The viewport width in portrait orientation.
 * @property {number} landscapeWidth - The viewport width in landscape orientation.
 */

 /** Gets the viewport size for the specified device.
 * @function
 * @name getViewportSize
 * @param {string} deviceName - Specifies the name of the target device. Use values from the Device Name column of [this table]{@link http://viewportsizes.com/}.
 * @returns {DeviceViewportSize} The size of the device viewport.
 */
export default function (deviceName) {
    deviceName = deviceName.toLowerCase().replace(/\s+/g, '');

    return DEVICE_DATABASE[deviceName];
}
