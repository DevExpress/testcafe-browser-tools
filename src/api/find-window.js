import OS from 'os-family';
import { EOL } from 'os';
import delay from '../utils/delay';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


/**
 * Retrieves a platform-specific window descriptor for the window that contains a web page with the specified title.
 * @function
 * @async
 * @name findWindow
 * @param {string} pageTitle - The title of the web page opened in a window whose descriptor should be retrieved.
 * @returns {object} a platform-specific window descriptor that can be used as a window identifier.
 **/
const GRANT_PERMISSIONS_RETRY_COUNT = 10;
const GRANT_PERMISSIONS_DELAY       = 3000;
const GRANT_PERMISSIONS_EXIT_CODE   = 2;

async function runFindWindowBinary (pageTitle) {
    for (let i = 0; i < GRANT_PERMISSIONS_RETRY_COUNT; i++) {
        try {
            return await execFile(BINARIES.findWindow, [pageTitle]);
        }
        catch (err) {
            const code = err.status || err.code;

            if (code === GRANT_PERMISSIONS_EXIT_CODE) {
                await delay(GRANT_PERMISSIONS_DELAY);

                continue;
            }

            throw err;
        }
    }
}

export default async function (pageTitle) {
    var res          = null;
    var windowParams = [];

    try {
        res = await runFindWindowBinary(pageTitle);
    }
    catch (err) {
        return null;
    }

    windowParams = res.split(EOL);

    if (OS.win)
        return { hwnd: windowParams[0], browser: windowParams[1] };

    if (OS.mac) {
        windowParams = windowParams.slice(windowParams.length - 4);

        return { processId: windowParams[0], cocoaId: windowParams[1], windowId: windowParams[2] };
    }

    if (OS.linux)
        return { windowId: windowParams[0] };
}
