import childProc from 'child_process';
import Promise from 'promise';
import OS from './os';


const OSASCRIPT_PATH = '/usr/bin/osascript';


var execFile = Promise.denodeify(childProc.execFile);

export default async function (filePath, args) {
    return OS.mac && filePath.endsWith('.scpt') ?
           await execFile(OSASCRIPT_PATH, [filePath].concat(args)) :
           await execFile(filePath, args);
}
