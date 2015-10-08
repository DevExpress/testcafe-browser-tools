import childProc from 'child_process';
import Promise from 'promise';
import OS from 'os-family';


const OSASCRIPT_PATH = '/usr/bin/osascript';


var execFilePromise = Promise.denodeify(childProc.execFile);
var execPromise     = Promise.denodeify(childProc.exec);

function endsWith (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

//API
export async function execFile (filePath, args) {
    return OS.mac && endsWith(filePath, '.scpt') ?
           await execFilePromise(OSASCRIPT_PATH, [filePath].concat(args)) :
           await execFilePromise(filePath, args);
}

export async function exec (command) {
    return await execPromise(command);
}
