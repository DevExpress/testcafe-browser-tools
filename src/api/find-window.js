import OS from 'os-family';
import { EOL } from 'os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';
import * as EXIT_CODES from '../exit-codes';
import { NativeBinaryHasFailedError, UnableToAccessScreenRecordingAPIError } from '../errors';


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
        if (!(err instanceof NativeBinaryHasFailedError))
            throw err;

        if (err.data.exitCode === EXIT_CODES.WINDOW_NOT_FOUND)
            return null;

        if (OS.mac && err.data.exitCode === EXIT_CODES.PERMISSION_ERROR)
            throw new UnableToAccessScreenRecordingAPIError(err.data);

        throw err;
    }
}

export default async function (pageTitle) {
    var res = await runFindWindowBinary(pageTitle);

    if (!res)
        return res;

    var windowParams = res.split(EOL);

    if (OS.win)
        return { hwnd: windowParams[0], browser: windowParams[1] };

    if (OS.mac)
        return { processId: windowParams[0], cocoaId: windowParams[1], windowId: windowParams[2] };

    if (OS.linux)
        return { windowId: windowParams[0] };

    return null;
}
