import OS from 'os-family';
import getWindowSize from './get-window-size';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import getDeviceSize from '../utils/get-device-size';
import BINARIES from '../binaries';
import { MESSAGES, getText } from '../messages';


function parseRequestedSize (args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number')
        return { width: args[0], height: args[1] };


    var size = getDeviceSize(args[0]);

    if (!size)
        throw new Error(getText(MESSAGES.deviceSizeAliasNotFound, args[0]));

    return args[1] === 'portrait' ?
           { width: size.portraitWidth, height: size.landscapeWidth } :
           { width: size.landscapeWidth, height: size.portraitWidth };

}

function getCorrectedSize (currentClientAreaSize, currentWindowSize, requestedSize) {
    var horizontalChrome = currentWindowSize.width - currentClientAreaSize.width;
    var verticalChrome   = currentWindowSize.height - currentClientAreaSize.height;

    return {
        width:  requestedSize.width + horizontalChrome,
        height: requestedSize.height + verticalChrome
    };
}

/**
 * Changes the browser's client area size to the new width and height.
 * @function
 * @async
 * @name resize
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {number} currentWidth - Specifies the current width of the browser's client area, in pixels. Use the window.innerWidth property to determine it.
 * @param {number} currentHeight - Specifies the current height of the browser's client area, in pixels. Use the window.innerHeight property to determine it.
 * @param {number} width - Specifies the new client area width, in pixels.
 * @param {number} height - Specifies the new client area height, in pixels.
 **/
/**
 * Changes the browser's client area size according to the screen size of the target device.
 * @function
 * @async
 * @name resize
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {number} currentWidth - Specifies the current width of the browser's client area, in pixels. Use the window.innerWidth property to determine it.
 * @param {number} currentHeight - Specifies the current height of the browser's client area, in pixels. Use the window.innerHeight property to determine it.
 * @param {string} deviceName - Specifies the name of the target device. You can use the values specified in the Device Name column of [this table]{@link http://viewportsizes.com/}.
 * @param {string} [orientation=landscape] - Specifies the device orientation: "portrait" or "landscape".

 */
export default async function (pageUrl, currentWidth, currentHeight, ...requestedSizeArgs) {
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

    var currentClientAreaSize = { width: currentWidth, height: currentHeight };
    var requestedSize         = parseRequestedSize(requestedSizeArgs);
    var currentWindowSize     = await getWindowSize(windowDescription);

    if (!currentWindowSize)
        return;

    var correctedSize = getCorrectedSize(currentClientAreaSize, currentWindowSize, requestedSize);

    resizeArguments = resizeArguments.concat([correctedSize.width, correctedSize.height]);

    await execFile(BINARIES.resize, resizeArguments);
}
