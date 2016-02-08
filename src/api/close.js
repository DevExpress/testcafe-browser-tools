import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

/**
 * Closes the browser window where the specified web page is opened.
 * @function
 * @async
 * @name close
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 */
export default async function (pageUrl) {
    var windowDescription = await findWindow(pageUrl);

    if (!windowDescription)
        return;

    var closeWindowArguments = void 0;

    if (OS.win)
        closeWindowArguments = [windowDescription.hwnd];
    else if (OS.mac)
        closeWindowArguments = [windowDescription.windowName, windowDescription.processName];
    else
        return;

    await execFile(BINARIES.close, closeWindowArguments);
}
