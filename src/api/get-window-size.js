import OS from 'os-family';
import { EOL } from 'os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


export default async function (windowDescription) {
    var res               = null;
    var windowParams      = [];

    var getWindowSizeArgs = void 0;

    if (OS.win)
        getWindowSizeArgs = [windowDescription.hwnd];
    else if (OS.mac)
        getWindowSizeArgs = [windowDescription.windowId, windowDescription.bundleId];
    else if (OS.linux)
        getWindowSizeArgs = [windowDescription.windowId];
    else
        return null;

    try {
        res = await execFile(BINARIES.getWindowSize, getWindowSizeArgs);
    }
    catch (err) {
        return null;
    }

    windowParams = res.split(EOL);

    return { width: Number(windowParams[0]), height: Number(windowParams[1]) };
}
