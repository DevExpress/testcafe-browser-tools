import OS from 'os-family';
import { parseRequestedSize } from './utils';
import findWindow from '../find-window';
import { execFile } from '../../utils/exec';
import BINARIES from '../../binaries';


/**
 * Changes the browser window size to the new width and height.
 * @function
 * @async
 * @name resize
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {number} width - Specifies the new window width in pixels.
 * @param {number} height - Specifies the new height in pixels.
 **/
/**
 * Changes the browser window size according to the screen size of the target device.
 * @function
 * @async
 * @name resize
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {string} deviceName - Specifies the name of the target device. You can use the values specified in the Device Name column of [this table]{@link http://viewportsizes.com/}.
 * @param {string} [orientation=landscape] - Specifies the device orientation: "portrait" or "landscape".
 */
export default async function (pageUrl, ...args) {
    var windowDescription = await findWindow(pageUrl);

    if (!windowDescription)
        return;

    var resizeArguments = void 0;

    if (OS.win)
        resizeArguments = [windowDescription.hwnd];
    else if (OS.mac)
        resizeArguments = [windowDescription.windowName, windowDescription.processName];
    else
        return;

    var { width, height } = await parseRequestedSize(args);

    resizeArguments = resizeArguments.concat([width, height]);

    await execFile(BINARIES.resize, resizeArguments);
}
