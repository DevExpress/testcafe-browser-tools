import childProc from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import OS from 'os-family';
import nanoid from 'nanoid';
import promisify from './promisify';
import BINARIES from '../binaries';


const OSASCRIPT_PATH = '/usr/bin/osascript';
const TEMP_FIFO_NAME = seed => `testcafe-browser-tools-fifo-${seed}`;

function getTempFIFOName () {
    return path.join(os.tmpdir(), TEMP_FIFO_NAME(nanoid()));
}

var execFilePromise = promisify(childProc.execFile);
var execPromise     = promisify(childProc.exec);

function endsWith (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function readFIFO (fifoPath) {
    return new Promise((resolve, reject) => {
        let data     = '';
        const stream = fs.createReadStream(fifoPath);

        stream.on('data', newData => data += newData ? newData.toString() : '');
        stream.on('end', () => resolve(data));
        stream.on('error', reject);
    })
}

function spawnApp (args) {
    return new Promise((resolve, reject) => {
        console.log(args);

        const child = childProc.spawn('/usr/bin/open', ['-n', '-a', BINARIES.app, '--args', ...args]);

        let outputData = '';

        child.on('error', reject);

        child.on('exit', code => {
            if (code)
                reject(new Error(`Exit code: ${code}\n${outputData}\n`));
            else
                resolve();
        });

        child.stdout.on('data', data => outputData += String(data));
        child.stderr.on('data', data => outputData += String(data));
    });
}

async function runWithMacApp (filePath, args) {
    const fifoName = getTempFIFOName();

    await execPromise(`mkfifo ${fifoName}`);

    try {
        const [data] = await Promise.all([
            readFIFO(fifoName),
            spawnApp([fifoName, filePath, ...args])
        ]);

        console.log(data);
        
        return data;
    }
    finally {
        await execPromise(`rm -rf ${fifoName}`);
    }
}

//API
export async function execFile (filePath, args) {
    if (!OS.mac)
        await execFilePromise(filePath, args);

    if (endsWith(filePath, '.scpt'))
        return await execFilePromise(OSASCRIPT_PATH, [filePath].concat(args));

    return await runWithMacApp(filePath, args);
}

export async function exec (command) {
    return execPromise(command, { env: process.env });
}

export async function execWinShellUtf8 (command) {
    var setCodePageCmd     = `FOR /F  "tokens=2 delims=:,." %i in ('chcp') do (chcp 65001`;
    var restoreCodePageCmd = 'chcp %i)';

    // NOTE: To avoid terminal errors, we need to restore the original code page after the command is executed.
    return await exec(`${setCodePageCmd} & ${command} & ${restoreCodePageCmd}`);
}
