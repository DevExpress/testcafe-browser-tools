import childProc from 'child_process';
import Promise from 'promise';
import os from './os.js';

const OSASCRIPT_PATH = '/usr/bin/osascript';

var execFile = Promise.denodeify(childProc.execFile);

export default function (filePath, args) {
    return os.mac && filePath.endsWith('.scpt') ?
           execFile(OSASCRIPT_PATH, [filePath].concat(args)) :
           execFile(filePath, args);
}
