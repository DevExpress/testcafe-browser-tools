import OS from 'os-family';
import getWindowSize from './get-window-size';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

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
 * @param {string | object} windowId - Specifies the title of the web page opened in the window or a descriptor returned by findWindow.
 * @param {number} currentWidth - Specifies the current width of the browser's client area, in pixels. Use the window.innerWidth property to determine it.
 * @param {number} currentHeight - Specifies the current height of the browser's client area, in pixels. Use the window.innerHeight property to determine it.
 * @param {number} width - Specifies the new client area width, in pixels.
 * @param {number} height - Specifies the new client area height, in pixels.
 **/
export default async function (windowId, currentWidth, currentHeight, width, height) {
    var windowDescription = typeof windowId === 'string' ? await findWindow(windowId) : windowId;

    if (!windowDescription)
        return;

    var resizeArguments = void 0;

    if (OS.win)
        resizeArguments = [windowDescription.hwnd];
    else if (OS.mac)
        resizeArguments = [windowDescription.windowId, windowDescription.bundleId];
    else if (OS.linux)
        resizeArguments = [windowDescription.windowId];
    else
        return;

    var currentClientAreaSize = { width: currentWidth, height: currentHeight };
    var requestedSize         = { width, height };
    var currentWindowSize     = await getWindowSize(windowDescription);

    if (!currentWindowSize)
        return;

    var correctedSize = getCorrectedSize(currentClientAreaSize, currentWindowSize, requestedSize);

    resizeArguments = resizeArguments.concat([correctedSize.width, correctedSize.height]);

    await execFile(BINARIES.resize, resizeArguments);
}
