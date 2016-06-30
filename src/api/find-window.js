import OS from 'os-family';
import { EOL } from 'os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


export default async function (pageTitle) {
    if (OS.linux)
        return null;

    var res          = null;
    var windowParams = [];

    try {
        res = await execFile(BINARIES.findWindow, [pageTitle]);
    }
    catch (err) {
        return null;
    }

    windowParams = res.split(EOL);

    if (OS.win)
        return { hwnd: windowParams[0], browser: windowParams[1] };

    if (OS.mac)
        return { bundleId: windowParams[0], windowId: windowParams[1] };
}
