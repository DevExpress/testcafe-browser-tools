import OS from 'os-family';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


export default async function (pageUrl) {
    if (OS.linux)
        return null;

    var res          = null;
    var windowParams = [];

    try {
        res = await execFile(BINARIES.findWindow, [pageUrl]);
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
