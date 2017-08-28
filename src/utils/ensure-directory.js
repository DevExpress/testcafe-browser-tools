import fs from 'graceful-fs';
import { dirname } from 'path';
import mkdirp from 'mkdirp';
import promisify from './promisify';
import delay from './delay';


const stat  = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mkdir = promisify(mkdirp);

const MAX_RETRY_COUNT = 10;
const RETRY_DELAY     = 100;

async function createDirectory (directoryPath) {
    try {
        await mkdir(directoryPath);
        return true;
    }
    catch (e) {
        return false;
    }
}

async function readDirectory (directoryPath) {
    try {
        await readdir(directoryPath);

        return true;
    }
    catch (e) {
        return false;
    }
}

async function ensureDirectory (directoryPath) {
    var fileEnsured   = await createDirectory(directoryPath) && await readDirectory(directoryPath);

    for (var i = 0; i < MAX_RETRY_COUNT && !fileEnsured; i++) {
        await delay(RETRY_DELAY);

        fileEnsured = await createDirectory(directoryPath) && await readDirectory(directoryPath);
    }

    return fileEnsured;
}

export default async function (fileName) {
    var directoryPath = dirname(fileName);

    try {
        var stats = await stat(directoryPath);

        return stats.isDirectory();
    }
    catch (e) {
        if (e.code === 'ENOENT')
            return await ensureDirectory(directoryPath);

        return false;
    }
}
