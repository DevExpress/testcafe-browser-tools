import { readSync } from 'read-file-relative';


const DEVICE_DATABASE = JSON.parse(readSync('../../data/devices.json'));

 /** Gets the name and the viewport size of all devices from [this table]{@link http://viewportsizes.com/}.
 * @function
 * @name getDeviceDatabase
 * @returns {DeviceDatabase} JSON Object which contains devices name and viewport size.
 */
export default function () {
    return DEVICE_DATABASE;
}
