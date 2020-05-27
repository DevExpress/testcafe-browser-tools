import childProc from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import del from 'del';
import execa from 'execa';
import OS from 'os-family';
import nanoid from 'nanoid';
import promisify from './promisify';
import BINARIES from '../binaries';
import flattenWhitespace from './flatten-whitespace';
import getEnvironmentVariable from './get-environment-variable';
import { NativeBinaryHasFailedError } from '../errors';


const EXIT_CODE_REGEXP = /Exit code: (-?\d+)/;

const OPEN_PATH      = '/usr/bin/open';
const TEMP_PIPE_NAME = seed => `testcafe-browser-tools-fifo-${seed}`;

const WINDOWS_DIR       = getEnvironmentVariable('SystemRoot') || 'C:\\Windows';
const SYSTEM32_DIR      = path.join(WINDOWS_DIR, 'System32');
const CHCP_COM          = path.join(SYSTEM32_DIR, 'chcp.com');
const POWERSHELL_DIR    = path.join(SYSTEM32_DIR, 'WindowsPowerShell\\v1.0');
const POWERSHELL_BINARY = path.join(POWERSHELL_DIR, 'powershell.exe');
const POWERSHELL_ARGS   = ['-NoProfile', '-NoLogo', '-NonInteractive', '-Command'];

const POWERSHELL_COMMAND_WRAPPER = command => flattenWhitespace `
    $cp = (${CHCP_COM} | Select-String '\d+').Matches.Value;
    Try
    {
        ${CHCP_COM} 65001;
        ${command};
    }
    Finally
    {
        ${CHCP_COM} $cp;
    }
`;

function getTempPipePath () {
    return path.join(os.tmpdir(), TEMP_PIPE_NAME(nanoid()));
}

var execFilePromise = promisify(childProc.execFile);
var execPromise     = promisify(childProc.exec);


function readPipe (pipePath) {
    return new Promise((resolve, reject) => {
        let data     = '';
        const stream = fs.createReadStream(pipePath);

        stream.on('data', newData => {
            data += newData ? newData.toString() : '';
        });

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

        function dataHandler (data) {
            outputData += String(data);
        }

        child.stdout.on('data', dataHandler);
        child.stderr.on('data', dataHandler);
    });
}

async function runWithMacApp (binaryPath, args) {
    const pipePath = getTempPipePath();

    await execPromise(`mkfifo ${pipePath}`);

    try {
        const [data] = await Promise.all([
            readPipe(pipePath),
            spawnApp(pipePath, binaryPath, args)
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

export async function execPowershell (command) {
    const wrappedCommand = POWERSHELL_COMMAND_WRAPPER(command);

    // NOTE: We have to ignore stdin due to a problem with PowerShell 2.0
    // See https://stackoverflow.com/a/9157170/11818061 for details.
    return execa(POWERSHELL_BINARY, [...POWERSHELL_ARGS, wrappedCommand], { stdin: 'ignore' });
}
