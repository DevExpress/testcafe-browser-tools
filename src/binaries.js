import OS from 'os-family';
import { toAbsPath } from 'read-file-relative';
import arch from './utils/arch';


var BINARIES = void 0;

if (OS.win) {
    BINARIES = {
        findWindow:        toAbsPath('../bin/win/find-window.exe'),
        getWindowSize:     toAbsPath('../bin/win/get-window-size.exe'),
        close:             toAbsPath('../bin/win/close.exe'),
        screenshot:        toAbsPath('../bin/win/screenshot.exe'),
        generateThumbnail: toAbsPath('../bin/win/generate-thumbnail.exe'),
        resize:            toAbsPath('../bin/win/resize.exe'),
        maximize:          toAbsPath('../bin/win/maximize.exe')
    };
}
else if (OS.mac) {
    BINARIES = {
        open:              toAbsPath('../bin/mac/open.scpt'),
        findWindow:        toAbsPath('../bin/mac/find-window.scpt'),
        getWindowSize:     toAbsPath('../bin/mac/get-window-size.scpt'),
        close:             toAbsPath('../bin/mac/close.scpt'),
        screenshot:        toAbsPath('../bin/mac/screenshot'),
        resize:            toAbsPath('../bin/mac/resize.scpt'),
        generateThumbnail: toAbsPath('../bin/mac/generate-thumbnail')
    };
}
else if (OS.linux) {
    BINARIES = {
        findWindow: toAbsPath('../bin/linux/find-window.sh'),
        close:      toAbsPath(`../bin/linux/${arch.bits}/close`)
    };
}
else
    BINARIES = {};

export default BINARIES;
