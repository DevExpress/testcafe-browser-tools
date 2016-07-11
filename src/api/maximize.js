import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


/**
 * Maximizes the specified browser window.
 * @function
 * @async
 * @name maximize
 * @param {string} pageTitle - The title of the web page opened in the window that should be maximized.
 **/
export default async function (pageTitle) {
    var windowDescription = await findWindow(pageTitle);

    if (!windowDescription)
        return;

    var commandArguments = void 0;

    // TODO: implement for macOS
    if (OS.win)
        commandArguments = [windowDescription.hwnd];
    else
        return;

    await execFile(BINARIES.maximize, commandArguments);
}
