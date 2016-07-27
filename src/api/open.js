import path from 'path';
import Mustache from 'mustache';
import OS from 'os-family';
import { exec } from '../utils/exec';
import exists from '../utils/fs-exists-promised';
import { MESSAGES, getText } from '../messages';


async function checkBrowserPath (browserInfo) {
    if (!browserInfo.path) {
        //NOTE: Path may be undefined when winOpenCmdTemplate is specified (e.g. MS Edge)
        if (browserInfo.winOpenCmdTemplate)
            return;

        throw new Error(getText(MESSAGES.browserPathNotSet));
    }

    var fileExists = await exists(browserInfo.path);

    if (!fileExists)
        throw new Error(getText(MESSAGES.unableToRunBrowser, browserInfo.path));
}

function getWinOpenCommand (browserInfo, pageUrl) {
    if (browserInfo.winOpenCmdTemplate) {
        return Mustache.render(browserInfo.winOpenCmdTemplate, {
            pageUrl: pageUrl
        });
    }

    var browserDirPath      = path.dirname(browserInfo.path);
    var browserExecFileName = path.basename(browserInfo.path);

    return `start /D "${browserDirPath}" ${browserExecFileName} ${browserInfo.cmd} ${pageUrl}`;
}

function getMacOpenCommand (browserInfo, pageUrl) {
    return Mustache.render(browserInfo.macOpenCmdTemplate, {
        path:    browserInfo.path,
        cmd:     browserInfo.cmd,
        pageUrl: pageUrl
    });
}

function getLinuxOpenCommand (browserInfo, pageUrl) {
    return `"${browserInfo.path}" "${browserInfo.cmd}" "${pageUrl}" 1<&- >/dev/null 2>&1 &`;
}

var getOpenCommand = null;

if (OS.win)
    getOpenCommand = getWinOpenCommand;
else if (OS.mac)
    getOpenCommand = getMacOpenCommand;
else if (OS.linux)
    getOpenCommand = getLinuxOpenCommand;

/**
 * Opens the web page in a new instance of the browser.
 * @function
 * @async
 * @name open
 * @param {BrowserInfo} browserInfo - Provides information on the browser where the web page should be opened.
 * @param {string} pageUrl - Specifies the web page URL.
 */
export default async function (browserInfo, pageUrl) {
    await checkBrowserPath(browserInfo);

    if (!getOpenCommand)
        return;

    var command = getOpenCommand(browserInfo, pageUrl);

    try {
        await exec(command);
    }
    catch (err) {
        throw new Error(getText(MESSAGES.unableToRunBrowser, browserInfo.path));
    }
}
