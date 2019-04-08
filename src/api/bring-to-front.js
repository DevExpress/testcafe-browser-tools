import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

/**
 * Brings the browser window on top of all other windows.
 * @function
 * @async
 * @name bringWindowToFront
 * @param {string | object} windowDescriptor - The title of the web page opened in the window or a descriptor returned by findWindow.
 */
export default async function (windowDescriptor) {
    var windowDescription = typeof windowDescriptor === 'string' ? await findWindow(windowDescriptor) : windowDescriptor;

    if (!windowDescription)
        return;

    var bringWindowToFrontArguments = void 0;

    if (OS.win)
        bringWindowToFrontArguments = [windowDescription.hwnd];
    else if (OS.linux)
        bringWindowToFrontArguments = [windowDescription.windowId];
    else if (OS.mac)
        bringWindowToFrontArguments = [windowDescription.processId, windowDescription.windowId];
    else
        return;

    await execFile(BINARIES.bringToFront, bringWindowToFrontArguments);
}
