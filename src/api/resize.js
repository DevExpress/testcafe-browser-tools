import viewport from 'viewport-list';
import Promise from 'promise';
import findWindow from './find-window';
import OS from '../utils/os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';
import { MESSAGES, getText } from '../messages';


const SIZE_RE = /(\d+)x(\d+)/;


var getDevices = Promise.denodeify(viewport);

function parseSize (sizeDescription) {
    var match = SIZE_RE.exec(sizeDescription);

    if (!match)
        return null;

    var portraitWidth  = Number(match[1]);
    var landscapeWidth = Number(match[2]);

    if (Number.isNaN(portraitWidth) || Number.isNaN(landscapeWidth))
        return null;

    return { portraitWidth, landscapeWidth };
}

async function getDeviceSize (deviceName) {
    var devices = await getDevices([deviceName]);

    var size = null;

    while (devices.length && !size)
        size = parseSize(devices.shift().size);

    return size;
}

async function parseArgs (args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number')
        return { width: args[0], height: args[1] };

    var size = await getDeviceSize(args[0]);

    if (!size)
        throw new Error(getText(MESSAGES.deviceSizeAliasNotFound, args[0]));

    return args[1] === 'portrait' ?
           { width: size.portraitWidth, height: size.landscapeWidth } :
           { width: size.landscapeWidth, height: size.portraitWidth };
}

/**
 * Changes the browser window size to the new width and height.
 * @function
 * @async
 * @name resize
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {number} width - Specifies the new window width in pixels.
 * @param {number} height - Specifies the new height in pixels.
 **/ /**
 * Changes the browser window size according to the screen size of the target device.
 * @function
 * @async
 * @name resize
 * @param {string} pageUrl - Specifies the URL of the web page opened in the browser.
 * @param {string} deviceName - Specifies the name of the target device. You can use the values specified in the Device Name column of [this table]{@link http://viewportsizes.com/}.
 * @param {string} [orientation=landscape] - Specifies the device orientation: "portrait" or "landscape".
 */
export default async function (pageUrl, ...args) {
    var windowDescription = await findWindow(pageUrl);

    if (!windowDescription)
        return;

    var resizeArguments = void 0;

    if (OS.win)
        resizeArguments = [windowDescription.hwnd];
    else if (OS.mac)
        resizeArguments = [windowDescription.windowName, windowDescription.processName];
    else
        return;

    var { width, height } = await parseArgs(args);

    resizeArguments = resizeArguments.concat([width, height]);

    await execFile(BINARIES.resize, resizeArguments);
}
