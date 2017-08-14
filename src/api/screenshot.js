import findWindow from './find-window';
import OS from 'os-family';
import { execFile } from '../utils/exec';
import ensureDirectory from '../utils/ensure-directory';
import BINARIES from '../binaries';


/**
 * Takes a screenshot of the browser window where the specified web page is opened.
 * @function
 * @async
 * @name screenshot
 * @param {string | object} windowDescriptor - Specifies the title of the web page opened in the window or a descriptor returned by findWindow.
 * @param {string} screenshotPath - Specifies the full path to the screenshot file. For example, D:\Temp\chrome-screenshot.jpg.
 */
export default async function (windowDescriptor, screenshotPath) {
    if (!ensureDirectory(screenshotPath))
        return;

    var windowDescription = typeof windowDescriptor === 'string' ? await findWindow(windowDescriptor) : windowDescriptor;

    if (!windowDescription)
        return;

    var screenshotArguments = void 0;

    if (OS.win)
        screenshotArguments = [windowDescription.hwnd, windowDescription.browser];
    else if (OS.mac)
        screenshotArguments = [windowDescription.cocoaId];
    else
        screenshotArguments = [windowDescription.windowId];

    await execFile(BINARIES.screenshot, screenshotArguments.concat(screenshotPath));
}
