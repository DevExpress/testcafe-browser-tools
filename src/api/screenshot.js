import path from 'path';
import findWindow from './find-window';
import OS from '../utils/os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


const SCREENSHOT_THUMBNAIL_WIDTH  = 240;
const SCREENSHOT_THUMBNAIL_HEIGHT = 130;


/**
 * Takes a screenshot of the browser window where the specified web page is opened.
 * @function
 * @async
 * @name screenshot
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {string} screenshotPath - Specifies the full path to the screenshot file. For example, D:\Temp\chrome-screenshot.jpg.
 */
// NOTE: in IE, we search for a window by the page URL, while in other browsers, we do this by the window title. So,
// if you need to find a window in a non-IE browser, put the page URL to the window title before running this.
export default async function (pageUrl, screenshotPath) {
    var screenshotDirPath = path.dirname(screenshotPath);
    var fileName          = path.basename(screenshotPath);
    var thumbnailDirPath  = path.join(screenshotDirPath, 'thumbnails');
    var windowDescription = void 0;

    if (OS.win) {
        var windowParams = await findWindow(pageUrl);

        if (!windowParams)
            return;

        windowDescription = [windowParams.hwnd, windowParams.browser];
    }
    else if (OS.mac)
        windowDescription = [pageUrl];
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
