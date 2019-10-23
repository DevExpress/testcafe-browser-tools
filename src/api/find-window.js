import OS from 'os-family';
import { EOL } from 'os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';
import { NativeBinaryHasFailedError, UnableToAccessScreenRecordingAPIError } from '../errors';


const GRANT_PERMISSIONS_EXIT_CODE = 2;

/**
 * Retrieves a platform-specific window descriptor for the window that contains a web page with the specified title.
 * @function
 * @async
 * @name findWindow
 * @param {string} pageTitle - The title of the web page opened in a window whose descriptor should be retrieved.
 * @returns {object} a platform-specific window descriptor that can be used as a window identifier.
 **/
async function runFindWindowBinary (pageTitle) {
    try {
        return await execFile(BINARIES.findWindow, [pageTitle]);
    }
    catch (err) {
        if (!err instanceof NativeBinaryHasFailedError)
            throw err;

        if (OS.mac && err.data.exitCode === GRANT_PERMISSIONS_EXIT_CODE)
            throw new UnableToAccessScreenRecordingAPIError(err.data);

        throw err;
    }
}

export default async function (pageTitle) {
    var res          = await runFindWindowBinary(pageTitle);
    var windowParams = res.split(EOL);

    if (OS.win)
        return { hwnd: windowParams[0], browser: windowParams[1] };

    if (OS.mac)
        return { processId: windowParams[0], cocoaId: windowParams[1], windowId: windowParams[2] };

    if (OS.linux)
        return { windowId: windowParams[0] };
}
