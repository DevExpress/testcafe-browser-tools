export { default as getInstallations } from './api/get-installations';
export { default as findWindow } from './api/find-window';
export { default as open } from './api/open';
export { default as close } from './api/close';
export { default as resize } from './api/resize';
export { default as maximize } from './api/maximize';
export { default as isMaximized } from './api/is-maximized';
export { default as isValidDeviceName } from './api/is-valid-device-name';
export { default as screenshot } from './api/screenshot';
export { default as generateThumbnail } from './api/generate-thumbnail';
export { default as getBrowserInfo } from './api/get-browser-info';
export { default as getViewportSize } from './api/get-viewport-size';
export { default as watchWindow } from './api/watch-window';
export { default as bringWindowToFront } from './api/bring-to-front';
export { default as getDevicesViewportData } from './api/get-devices-viewport-data';

import * as errors from './errors';

export { errors };
