var { execSync } = require('child_process');

const LIBC_TYPE = {
    glibc:   'glibc',
    musl:    'musl',
    unknown: 'unknown'
};

const bits = process.arch === 'x64' ? 64 : 32;

function getLddOutput () {
    try {
        return execSync('ldd --version').toString().split('\n');
    }
    catch (e) {
        var output = e.message.split('\n');

        output.shift();

        return output;
    }
}

function getLibCType () {
    var lddOutput = getLddOutput();

    if (/glibc/i.test(lddOutput[0]))
        return LIBC_TYPE.glibc;
    else if (/musl/i.test(lddOutput[0]))
        return LIBC_TYPE.musl;

    return LIBC_TYPE.unknown;
}

const libcType = getLibCType();

exports.platform = `${libcType}-${bits}`;
