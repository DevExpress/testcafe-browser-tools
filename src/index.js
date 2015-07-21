import path from 'path';
import Mustache from 'mustache';
import { exec, execFile } from './utils/exec';
import OS from './utils/os';
import NATIVES from './natives';
import * as browserInstallations from './installations';
import { MESSAGES, getText } from './messages';
import exists from './utils/fs-exists-promised';

const SCREENSHOT_THUMBNAIL_WIDTH  = 240;
const SCREENSHOT_THUMBNAIL_HEIGHT = 130;


export var getInstallations = browserInstallations.get;

async function findWindow (pageUrl) {
    if (OS.linux)
        return null;

    var res          = null;
    var windowParams = [];

    try {
        res = await execFile(NATIVES.findWindow, [pageUrl]);
    }
    catch (err) {
        return null;
    }

    if (OS.win) {
        windowParams = res.split(' ');

        return { hwnd: windowParams[0], browser: windowParams[1] };
    }

    if (OS.mac) {
        windowParams = res.split('\n');

        return { processName: windowParams[0], windowName: windowParams[1] };
    }
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
        var windowParams = await findWindow(pageUrl);

        if (!windowParams)
            return;

        windowDescription = [windowParams.hwnd, windowParams.browser];
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

    await execFile(NATIVES.closeWindow, closeWindowArguments);
}

export async function open (browserInfo, pageUrl) {
    if (!browserInfo.path)
        throw new Error(getText(MESSAGES.browserPathNotSet));

    var fileExists = await exists(browserInfo.path);

    if (!fileExists)
        throw new Error(getText(MESSAGES.unableToRunBrowser, browserInfo.path));

    var command = '';

    /*eslint-disable indent*/
    //NOTE: eslint disabled because of the https://github.com/eslint/eslint/issues/2343 issue
    if (OS.win) {
        var browserDirPath      = path.dirname(browserInfo.path);
        var browserExecFileName = path.basename(browserInfo.path);

        command = `start /D "${browserDirPath}" ${browserExecFileName} ${browserInfo.cmd} ${pageUrl}`;
    }
    else if (OS.mac) {
        command = Mustache.render(browserInfo.macOpenCmdTemplate, {
            path:    browserInfo.path,
            cmd:     browserInfo.cmd,
            pageUrl: pageUrl
        });
    }
    else
        return; //TODO: support OS.linux
    /*eslint-enable indent*/

    try {
        await exec(command);
    }
    catch (err) {
        throw new Error(getText(MESSAGES.unableToRunBrowser, browserInfo.path));
    }
}

//TODO:
/*export function resize () {
 }*/
