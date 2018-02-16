import childProc from 'child_process';
import OS from 'os-family';
import promisify from './promisify';


const OSASCRIPT_PATH         = '/usr/bin/osascript';
const MAX_STDOUT_BUFFER_SIZE = 10 * 1024 * 1024;


var execFilePromise = promisify(childProc.execFile);
var execPromise     = promisify(childProc.exec);

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
    return execPromise(command, { env: process.env, maxBuffer: MAX_STDOUT_BUFFER_SIZE });
}

export async function execWinShellUtf8 (command) {
    var setCodePageCmd     = `FOR /F  "tokens=2 delims=:,." %i in ('chcp') do (chcp 65001`;
    var restoreCodePageCmd = 'chcp %i)';

    // NOTE: To avoid terminal errors, we need to restore the original code page after the command is executed.
    return await exec(`${setCodePageCmd} & ${command} & ${restoreCodePageCmd}`);
}
