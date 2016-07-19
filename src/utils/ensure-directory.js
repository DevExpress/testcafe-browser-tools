import fs from 'fs';
import { dirname } from 'path';
import promisify from './promisify';

var stat = promisify(fs.stat);
var mkdir = promisify(fs.mkdir);

async function createDirectory (directoryPath) {
    try {
        await mkdir(directoryPath);
        return true;
    }
    catch (e) {
        return false;
    }
}

export default async function (fileName) {
    var directoryPath = dirname(fileName);

    try {
        var stats = await stat(directoryPath);

        return stats.isDirectory();
    }
    catch (e) {
        if (e.code === 'ENOENT')
            return createDirectory(directoryPath);

        return false;
    }
}
