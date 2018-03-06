import getInstallations from './api/get-installations';
import findWindow from './api/find-window';
import open from './api/open';
import close from './api/close';
import resize from './api/resize';
import maximize from './api/maximize';
import isMaximized from './api/is-maximized';
import isValidDeviceName from './api/is-valid-device-name';
import screenshot from './api/screenshot';
import generateThumbnail from './api/generate-thumbnail';
import getBrowserInfo from './api/get-browser-info';
import getViewportSize from './api/get-viewport-size';
import watchWindow from './api/watch-window';
import bringWindowToFront from './api/bring-to-front';
import getDevicesViewportData from './api/get-devices-viewport-data';


export default {
    getInstallations,
    getBrowserInfo,
    getViewportSize,
    findWindow,
    open,
    close,
    resize,
    maximize,
    isMaximized,
    screenshot,
    generateThumbnail,
    isValidDeviceName,
    watchWindow,
    bringWindowToFront,
    getDevicesViewportData
};
