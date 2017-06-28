import findWindow from './find-window';
import getWindowSize from './get-window-size';
import delay from '../utils/delay';


const DEFAULT_WATCHING_INTERVAL = 2000;

export default async function (pageTitle, watchingInterval = DEFAULT_WATCHING_INTERVAL) {
    var windowDescription = await findWindow(pageTitle);

    if (!windowDescription)
        return;

    var windowSize = await getWindowSize(windowDescription);

    while (windowSize && windowSize.width && windowSize.height) {
        await delay(watchingInterval);
        windowSize = await getWindowSize(windowDescription);
    }
}
