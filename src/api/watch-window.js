import findWindow from './find-window';
import getWindowSize from './get-window-size';
import delay from '../utils/delay';


const DEFAULT_WATCHING_INTERVAL = 2000;

/**
 * Pause execution of a Promise chain while the specified browser window is opened.
 * @function
 * @name watchWindow
 * @param {string | object} windowDescriptor - The title of the web page opened in the window or a descriptor returned by findWindow
 * @param {number} [watchingInterval=2000] - A time interval in milliseconds between checking the window state
 * @returns Promise<undefined> A Promise which resolves when the browser window is closed.
 **/
export default async function (windowDescriptor, watchingInterval = DEFAULT_WATCHING_INTERVAL) {
    var windowDescription = typeof windowDescriptor === 'string' ? await findWindow(windowDescriptor) : windowDescriptor;

    if (!windowDescription)
        return;

    var windowSize = await getWindowSize(windowDescription);

    while (windowSize && windowSize.width && windowSize.height) {
        await delay(watchingInterval);
        windowSize = await getWindowSize(windowDescription);
    }
}
