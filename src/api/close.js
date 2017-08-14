import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

/**
 * Closes the browser window where the specified web page is opened.
 * @function
 * @async
 * @name close
 * @param {string | object} windowId - The title of the web page opened in the window or a descriptor returned by findWindow
 *                                     of the window that should be closed.
 */
export default async function (windowId) {
    var windowDescription = typeof windowId === 'string' ? await findWindow(windowId) : windowId;

    if (!windowDescription)
        return;

    var closeWindowArguments = void 0;

    if (OS.win)
        closeWindowArguments = [windowDescription.hwnd];
    else if (OS.mac)
        closeWindowArguments = [windowDescription.windowId, windowDescription.bundleId];
    else if (OS.linux)
        closeWindowArguments = [windowDescription.windowId];
    else
        return;

    await execFile(BINARIES.close, closeWindowArguments);
}
