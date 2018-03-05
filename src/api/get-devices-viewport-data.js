import { readSync } from 'read-file-relative';


const VIEWPORT_DATA = JSON.parse(readSync('../../data/devices.json'));

 /** Gets the name and the viewport size of all devices from [this table]{@link http://viewportsizes.com/}.
 * @function
 * @name getDevicesViewportData
 * @returns {ViewportData} JSON Object which contains devices name and viewport size.
 */
export default function () {
    return VIEWPORT_DATA;
}
