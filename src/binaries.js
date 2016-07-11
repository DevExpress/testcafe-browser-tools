import OS from 'os-family';
import { toAbsPath } from 'read-file-relative';


var BINARIES = void 0;

if (OS.win) {
    BINARIES = {
        findWindow:    toAbsPath('../bin/win/find-window.exe'),
        getWindowSize: toAbsPath('../bin/win/get-window-size.exe'),
        close:         toAbsPath('../bin/win/close.exe'),
        screenshot:    toAbsPath('../bin/win/screenshot.exe'),
        resize:        toAbsPath('../bin/win/resize.exe'),
        maximize:      toAbsPath('../bin/win/maximize.exe')
    };
}
else if (OS.mac) {
    BINARIES = {
        open:          toAbsPath('../bin/mac/open.scpt'),
        findWindow:    toAbsPath('../bin/mac/find-window.scpt'),
        getWindowSize: toAbsPath('../bin/mac/get-window-size.scpt'),
        close:         toAbsPath('../bin/mac/close.scpt'),
        screenshot:    toAbsPath('../bin/mac/screenshot'),
        resize:        toAbsPath('../bin/mac/resize.scpt')
    };
}
else if (OS.linux)
    BINARIES = {};

export default BINARIES;
