import path from 'path';
import execFile from './utils/exec-file.js';
import os from './utils/os.js';
import relativeFileName from './utils/relative-file-name.js';

const FIND_WINDOW_WIN_EXEC_PATH  = relativeFileName('bin/find-window.exe');
const CLOSE_WINDOW_WIN_EXEC_PATH = relativeFileName('bin/close-window.exe');
const SHOT_WINDOW_WIN_EXEC_PATH  = relativeFileName('bin/shot-window.exe');

const FIND_WINDOW_MAC_SCRIPT_PATH  = relativeFileName('bin/find-window.scpt');
const CLOSE_WINDOW_MAC_SCRIPT_PATH = relativeFileName('bin/close-window.scpt');
const SHOT_WINDOW_MAC_EXEC_PATH    = relativeFileName('bin/shot-window');

const SCREENSHOT_THUMBNAIL_WIDTH  = 240;
const SCREENSHOT_THUMBNAIL_HEIGHT = 130;


async function findWindow (pageUrl) {
    var execFilePath = os.mac ? FIND_WINDOW_MAC_SCRIPT_PATH : FIND_WINDOW_WIN_EXEC_PATH;

    var res = await execFile(execFilePath, [pageUrl]);

    if (os.win) {
        var windowParams = res.split(' ');

        return { hwnd: windowParams[0], browser: windowParams[1] };
    }

    if (os.mac)
        return { processName: res.trim() };
}

// NOTE: in IE, we search for a window by the page URL, while in other browsers, we do this by the window title. So,
// if you need to find a window in a non-IE browser, put the page URL to the window title before running this.
export async function screenshot (pageUrl, screenshotPath) {
    var folderPath          = path.dirname(screenshotPath);
    var fileName            = path.basename(screenshotPath);
    var thumbnailFolderPath = path.join(folderPath, 'thumbnails');

    if (os.win) {
        var { hwnd, browser } = await findWindow(pageUrl);

        await execFile(SHOT_WINDOW_WIN_EXEC_PATH, [hwnd, browser, folderPath, fileName, thumbnailFolderPath,
            SCREENSHOT_THUMBNAIL_WIDTH, SCREENSHOT_THUMBNAIL_HEIGHT]);
    }
    else if (os.mac)
    await execFile(SHOT_WINDOW_MAC_EXEC_PATH, [pageUrl, folderPath, fileName, thumbnailFolderPath,
    SCREENSHOT_THUMBNAIL_WIDTH, SCREENSHOT_THUMBNAIL_HEIGHT]);


}

export async function close (pageUrl) {
    var windowParams = await findWindow(pageUrl);

    if (os.win)
        await execFile(CLOSE_WINDOW_WIN_EXEC_PATH, [windowParams.hwnd]);
    else if (os.mac)
        await execFile(CLOSE_WINDOW_MAC_SCRIPT_PATH, [pageUrl, windowParams.processName]);
}

//TODO:
/*export function resize () {
 }*/
