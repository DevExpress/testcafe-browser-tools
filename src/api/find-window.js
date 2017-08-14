import OS from 'os-family';
import { EOL } from 'os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


/**
 * Retrieves a platform-specific window descriptor for the window that contains a web page with the specified title.
 * @function
 * @async
 * @name findWindow
 * @param {string | object} pageTitle - The title of the web page opened in the window which descriptor should be retrieved.
 * @returns {object} a platform-specific window descriptor that can be used as a window identifier in some other API functions.
 **/
export default async function (pageTitle) {
    var res          = null;
    var windowParams = [];

    try {
        res = await execFile(BINARIES.findWindow, [pageTitle]);

        if (OS.mac)
            res += await execFile(BINARIES.findWindowCocoa, [pageTitle]);
    }
    catch (err) {
        return null;
    }

    windowParams = res.split(EOL);

    if (OS.win)
        return { hwnd: windowParams[0], browser: windowParams[1] };

    if (OS.mac)
        return { bundleId: windowParams[0], windowId: windowParams[1], cocoaId: windowParams[2] };

    if (OS.linux)
        return { windowId: windowParams[0] };
}
