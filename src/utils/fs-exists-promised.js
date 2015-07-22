import fs from 'fs';
import Promise from 'promise';

export default function (filePath) {
    return new Promise(resolve => fs.exists(filePath, resolve));
}
