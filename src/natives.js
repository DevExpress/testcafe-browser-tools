import OS from './utils/os';
import toAbsPath from './utils/to-abs-path';


var NATIVES = void 0;

if (OS.win) {
    NATIVES = {
        findWindow:  toAbsPath('../bin/win/find-window.exe'),
        closeWindow: toAbsPath('../bin/win/close-window.exe'),
        shotWindow:  toAbsPath('../bin/win/screenshot.exe')
    };
}
else if (OS.mac) {
    NATIVES = {
        openWindow:  toAbsPath('../bin/mac/open-window.scpt'),
        findWindow:  toAbsPath('../bin/mac/find-window.scpt'),
        closeWindow: toAbsPath('../bin/mac/close-window.scpt'),
        shotWindow:  toAbsPath('../bin/mac/screenshot')
    };
}
/*eslint-disable indent*/
//NOTE: eslint disabled because of the https://github.com/eslint/eslint/issues/2343 issue
else if (OS.linux)
    NATIVES = {};
/*eslint-enable indent*/

export default NATIVES;
