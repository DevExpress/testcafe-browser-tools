import childProc from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import del from 'del';
import OS from 'os-family';
import nanoid from 'nanoid';
import promisify from './promisify';
import BINARIES from '../binaries';
import { NativeBinaryHasFailedError } from '../errors';


const EXIT_CODE_REGEXP = /Exit code: (-?\d+)/;

const OPEN_PATH      = '/usr/bin/open';
const TEMP_PIPE_NAME = seed => `testcafe-browser-tools-fifo-${seed}`;

function getTempPipePath () {
    return path.join(os.tmpdir(), TEMP_PIPE_NAME(nanoid()));
}

var execFilePromise = promisify(childProc.execFile);
var execPromise     = promisify(childProc.exec);


function readPipe (pipePath) {
    return new Promise((resolve, reject) => {
        let data     = '';
        const stream = fs.createReadStream(pipePath);

        stream.on('data', newData => data += newData ? newData.toString() : '');
        stream.on('end', () => resolve(data));
        stream.on('error', reject);
    });
}

function spawnApp (pipePath, binaryPath, args) {
    return new Promise((resolve, reject) => {
        const child = childProc.spawn(OPEN_PATH, ['-n', '-a', BINARIES.app, '--args', pipePath, binaryPath, ...args]);

        let outputData = '';

        child.on('error', reject);

        child.on('exit', code => {
            if (code)
                reject(new NativeBinaryHasFailedError({ binary: binaryPath, exitCode: code, output: outputData }));
            else
                resolve();
        });

        child.stdout.on('data', data => outputData += String(data));
        child.stderr.on('data', data => outputData += String(data));
    });
}

async function runWithMacApp (binaryPath, args) {
    const pipePath = getTempPipePath();

    await execPromise(`mkfifo ${pipePath}`);

    try {
        const [data] = await Promise.all([
            readPipe(pipePath),
            spawnApp(pipePath, binaryPath, [args])
        ]);

        const exitCodeMatch = data.match(EXIT_CODE_REGEXP);

        if (!exitCodeMatch)
            return data;

        const exitCode = Number(exitCodeMatch[1]);

        if (exitCode)
            throw new NativeBinaryHasFailedError({ binary: binaryPath, output: data, exitCode });

        return data;
    }
    finally {
        await del(pipePath, { force: true });
    }
}

//API
export async function execFile (filePath, args) {
    try {
        if (OS.mac)
            return await runWithMacApp(filePath, args);

        return await execFilePromise(filePath, args);
    }
    catch (err) {
        if (err instanceof NativeBinaryHasFailedError)
            throw err;

        const errorCode = err.status || err.code;

        if (errorCode === void 0 || typeof errorCode === 'string')
            throw err;

        throw new NativeBinaryHasFailedError({ binary: filePath, exitCode: errorCode });
    }
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
