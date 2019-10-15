import { join } from 'path';
import OS from 'os-family';
import { toAbsPath } from 'read-file-relative';
import { platform } from 'linux-platform-info';


const MAC_APP_NAME    = 'TestCafe Browser Tools.app';
const MAC_BINARY_PATH = binary => join(__dirname, `../bin/mac/${MAC_APP_NAME}/Contents/MacOS/${binary}`);

var BINARIES = void 0;

if (OS.win) {
    BINARIES = {
        findWindow:        toAbsPath('../bin/win/find-window.exe'),
        getWindowSize:     toAbsPath('../bin/win/get-window-size.exe'),
        close:             toAbsPath('../bin/win/close.exe'),
        screenshot:        toAbsPath('../bin/win/screenshot.exe'),
        generateThumbnail: toAbsPath('../bin/win/generate-thumbnail.exe'),
        resize:            toAbsPath('../bin/win/resize.exe'),
        maximize:          toAbsPath('../bin/win/maximize.exe'),
        bringToFront:      toAbsPath('../bin/win/bring-to-front.exe')
    };
}
else if (OS.mac) {
    BINARIES = {
        app:                MAC_BINARY_PATH('testcafe-browser-tools'),
        open:               'open',
        findWindow:         'find-window',
        getWindowSize:      'get-window-size',
        getWindowBounds:    'get-window-bounds',
        getWindowMaxBounds: 'get-window-max-bounds',
        setWindowBounds:    'set-window-bounds',
        close:              'close',
        screenshot:         'screenshot',
        resize:             'resize',
        generateThumbnail:  'generate-thumbnail',
        bringToFront:       'bring-to-front'
    };
}
else if (OS.linux) {
    BINARIES = {
        findWindow:        toAbsPath(`../bin/linux/${platform}/find-window`),
        close:             toAbsPath(`../bin/linux/${platform}/close`),
        getWindowSize:     toAbsPath(`../bin/linux/${platform}/get-window-size`),
        resize:            toAbsPath(`../bin/linux/${platform}/resize`),
        maximize:          toAbsPath(`../bin/linux/${platform}/maximize`),
        screenshot:        toAbsPath(`../bin/linux/${platform}/screenshot`),
        generateThumbnail: toAbsPath(`../bin/linux/${platform}/generate-thumbnail`),
        bringToFront:      toAbsPath(`../bin/linux/${platform}/bring-to-front`)
    };
}
else
    BINARIES = {};

export default BINARIES;
