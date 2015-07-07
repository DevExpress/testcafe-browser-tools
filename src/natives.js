import OS from './utils/os';
import toAbsPath from './utils/to-abs-path';


var NATIVES = void 0;

if (OS.win)
    NATIVES = {
        findWindow:  toAbsPath('bin/find-window.exe'),
        closeWindow: toAbsPath('bin/close-window.exe'),
        shotWindow:  toAbsPath('bin/shot-window.exe')
    };
else if (OS.mac)
    NATIVES = {
        findWindow:  toAbsPath('bin/find-window.scpt'),
        closeWindow: toAbsPath('bin/close-window.scpt'),
        shotWindow:  toAbsPath('bin/shot-window')
    };

export default NATIVES;
