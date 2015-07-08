import path from 'path';
import execFile from './utils/exec-file';
import OS from './utils/os';
import NATIVES from './natives';


const SCREENSHOT_THUMBNAIL_WIDTH  = 240;
const SCREENSHOT_THUMBNAIL_HEIGHT = 130;


async function findWindow (pageUrl) {
    if (OS.linux)
        return null;

    var res = await execFile(NATIVES.findWindow, [pageUrl]);

    if (OS.win) {
        var windowParams = res.split(' ');

        return { hwnd: windowParams[0], browser: windowParams[1] };
    }

    if (OS.mac)
        return { processName: res.trim() };
}

// NOTE: in IE, we search for a window by the page URL, while in other browsers, we do this by the window title. So,
// if you need to find a window in a non-IE browser, put the page URL to the window title before running this.
export async function screenshot (pageUrl, screenshotPath) {
    var screenshotDirPath = path.dirname(screenshotPath);
    var fileName          = path.basename(screenshotPath);
    var thumbnailDirPath  = path.join(screenshotDirPath, 'thumbnails');
    var windowDescription = void 0;

    /*eslint-disable indent*/
    //NOTE: eslint disabled because of the https://github.com/eslint/eslint/issues/2343 issue
    if (OS.win) {
        var { hwnd, browser } = await findWindow(pageUrl);

        windowDescription = [hwnd, browser];
    }
    else if (OS.mac)
        windowDescription = [pageUrl];
    else
        return;
    /*eslint-enable indent*/

    await execFile(NATIVES.shotWindow, windowDescription.concat([
        screenshotDirPath,
        fileName,
        thumbnailDirPath,
        SCREENSHOT_THUMBNAIL_WIDTH,
        SCREENSHOT_THUMBNAIL_HEIGHT
    ]));
}

export async function close (pageUrl) {
    var windowDescription    = await findWindow(pageUrl);
    var closeWindowArguments = void 0;

    if (OS.win)
        closeWindowArguments = [windowDescription.hwnd];
    else if (OS.mac)
        closeWindowArguments = [pageUrl, windowDescription.processName];
    else
        return;

    await execFile(NATIVES.closeWindow, closeWindowArguments);
}

//TODO:
/*export function resize () {
 }*/
