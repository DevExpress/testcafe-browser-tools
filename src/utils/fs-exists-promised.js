import fs from 'graceful-fs';
import Promise from 'pinkie';


export default function (filePath) {
    return new Promise(resolve => fs.exists(filePath, resolve));
}
