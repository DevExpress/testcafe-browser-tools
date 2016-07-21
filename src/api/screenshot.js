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
 * @param {string} pageTitle - Specifies the title of the web page opened in the browser.
 * @param {string} screenshotPath - Specifies the full path to the screenshot file. For example, D:\Temp\chrome-screenshot.jpg.
 */
export default async function (pageTitle, screenshotPath) {
    if (!ensureDirectory(screenshotPath))
        return;

    var windowDescription = void 0;

    if (OS.win) {
        var windowParams = await findWindow(pageTitle);

        if (!windowParams)
            return;

        windowDescription = [windowParams.hwnd, windowParams.browser];
    }
    else if (OS.mac)
        windowDescription = [pageTitle];
    else
        return;

    await execFile(BINARIES.screenshot, windowDescription.concat(screenshotPath));
}
