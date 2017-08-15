import OS from 'os-family';
import { toAbsPath } from 'read-file-relative';
import { platform } from 'linux-platform-info';


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
        open:               toAbsPath('../bin/mac/open.scpt'),
        findWindow:         toAbsPath('../bin/mac/find-window.scpt'),
        findWindowCocoa:    toAbsPath('../bin/mac/find-window-cocoa'),
        getWindowSize:      toAbsPath('../bin/mac/get-window-size.scpt'),
        getWindowBounds:    toAbsPath('../bin/mac/get-window-bounds.scpt'),
        getWindowMaxBounds: toAbsPath('../bin/mac/get-window-max-bounds'),
        setWindowBounds:    toAbsPath('../bin/mac/set-window-bounds.scpt'),
        close:              toAbsPath('../bin/mac/close.scpt'),
        screenshot:         toAbsPath('../bin/mac/screenshot'),
        resize:             toAbsPath('../bin/mac/resize.scpt'),
        generateThumbnail:  toAbsPath('../bin/mac/generate-thumbnail')
    };
}
else if (OS.linux) {
    BINARIES = {
        findWindow:        toAbsPath('../bin/linux/find-window.sh'),
        close:             toAbsPath(`../bin/linux/${platform}/close`),
        getWindowSize:     toAbsPath(`../bin/linux/${platform}/get-window-size`),
        resize:            toAbsPath(`../bin/linux/${platform}/resize`),
        maximize:          toAbsPath(`../bin/linux/${platform}/maximize`),
        screenshot:        toAbsPath(`../bin/linux/${platform}/screenshot`),
        generateThumbnail: toAbsPath(`../bin/linux/${platform}/generate-thumbnail`)
    };
}
else
    BINARIES = {};

export default BINARIES;
