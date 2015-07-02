import path from 'path';
import callSite from 'callsite';

export default function (relativePath) {
    var caller     = callSite()[1];
    var callerPath = caller.getFileName();
    var basePath   = path.dirname(callerPath);
    var filePath   = path.join(basePath, relativePath);

    return filePath;
}
