import OS from 'os-family';
import { EOL } from 'os';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


/**
 * Checks if the specified browser window is maximized.
 * @function
 * @async
 * @name isMaximized
 * @param {string | object} windowId - The title of the web page opened in the window or a descriptor returned by findWindow.
 * @return {boolean} `true` if the browser window is maximized
 **/
export default async function (windowId) {
    var windowDescription = typeof windowId === 'string' ? await findWindow(windowId) : windowId;

    if (!windowDescription)
        return false;

    var commandArguments = void 0;

    // TODO: implement for macOS
    if (OS.win)
        commandArguments = [windowDescription.hwnd];
    else
        return false;

    var result = await execFile(BINARIES.maximize, commandArguments.concat('status'));

    return result.replace(EOL, '').toLowerCase() === 'true';
}
