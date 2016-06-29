import path from 'path';
import findWindow from './find-window';
import OS from 'os-family';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


const SCREENSHOT_THUMBNAIL_WIDTH  = 240;
const SCREENSHOT_THUMBNAIL_HEIGHT = 130;


/**
 * Takes a screenshot of the browser window where the specified web page is opened.
 * @function
 * @async
 * @name screenshot
 * @param {string} pageTitle - Specifies the title of the web page opened in the browser.
 * @param {string} screenshotPath - Specifies the full path to the screenshot file. For example, D:\Temp\chrome-screenshot.jpg.
 */
export default async function (pageTitle, screenshotPath) {
    var screenshotDirPath = path.dirname(screenshotPath);
    var fileName          = path.basename(screenshotPath);
    var thumbnailDirPath  = path.join(screenshotDirPath, 'thumbnails');
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

    await execFile(BINARIES.screenshot, windowDescription.concat([
        screenshotDirPath,
        fileName,
        thumbnailDirPath,
        SCREENSHOT_THUMBNAIL_WIDTH,
        SCREENSHOT_THUMBNAIL_HEIGHT
    ]));
}
