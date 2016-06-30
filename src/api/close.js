import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

/**
 * Closes the browser window where the specified web page is opened.
 * @function
 * @async
 * @name close
 * @param {string} pageTitle - Specifies the title of the web page opened in the browser.
 */
export default async function (pageTitle) {
    var windowDescription = await findWindow(pageTitle);

    if (!windowDescription)
        return;

    var closeWindowArguments = void 0;

    if (OS.win)
        closeWindowArguments = [windowDescription.hwnd];
    else if (OS.mac)
        closeWindowArguments = [windowDescription.windowId, windowDescription.bundleId];
    else
        return;

    await execFile(BINARIES.close, closeWindowArguments);
}
