import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

function getBoundsFromString (boundsString) {
    return boundsString.split('\n');
}

async function getWindowBounds (processId, windowId) {
    var boundsString = await execFile(BINARIES.getWindowBounds, [processId, windowId]);

    return getBoundsFromString(boundsString);
}

async function getWindowMaxBounds (processId, windowId) {
    var windowBounds    = await getWindowBounds(processId, windowId);
    var maxBoundsString = await execFile(BINARIES.getWindowMaxBounds, windowBounds);

    return getBoundsFromString(maxBoundsString);
}

async function maximizeWindowMac (windowDescription) {
    var { processId, windowId } = windowDescription;
    var windowBounds           = await getWindowMaxBounds(processId, windowId);

    await execFile(BINARIES.setWindowBounds, [processId, windowId].concat(windowBounds));
}
/**
 * Maximizes the specified browser window.
 * @function
 * @async
 * @name maximize
 * @param {string | object} windowDescriptor - The title of the web page opened in the window or a descriptor returned by findWindow.
 **/
export default async function (windowDescriptor) {
    var windowDescription = typeof windowDescriptor === 'string' ? await findWindow(windowDescriptor) : windowDescriptor;

    if (!windowDescription)
        return;

    var commandArguments = void 0;

    if (OS.win)
        commandArguments = [windowDescription.hwnd];
    else if (OS.linux)
        commandArguments = [windowDescription.windowId];
    else if (OS.mac) {
        await maximizeWindowMac(windowDescription);

        return;
    }
    else
        return;

    await execFile(BINARIES.maximize, commandArguments);
}
