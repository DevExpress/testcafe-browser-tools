import OS from './utils/os';
import toAbsPath from './utils/to-abs-path';


var NATIVES = void 0;

if (OS.win)
    NATIVES = {
        findWindow:  toAbsPath('../bin/win/find-window.exe'),
        closeWindow: toAbsPath('../bin/win/close-window.exe'),
        shotWindow:  toAbsPath('../bin/win/shot-window.exe')
    };
else if (OS.mac)
    NATIVES = {
        findWindow:  toAbsPath('../bin/mac/find-window.scpt'),
        closeWindow: toAbsPath('../bin/mac/close-window.scpt'),
        shotWindow:  toAbsPath('../bin/mac/shot-window')
    };

export default NATIVES;
