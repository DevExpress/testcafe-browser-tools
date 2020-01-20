import { readSync } from 'read-file-relative';


const VIEWPORT_DATA = JSON.parse(readSync('../../data/devices.json'));

/** Gets the name and the viewport size of all devices from [this table]{@link http://viewportsizes.com/}.
 * @function
 * @name getDevicesViewportData
 * @returns {ViewportData} A JSON Object that contains device names and viewport sizes.
 */
export default function () {
    return VIEWPORT_DATA;
}
