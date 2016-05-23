import viewport from 'viewport-list';
import promisify from '../../utils/promisify';
import { MESSAGES, getText } from '../../messages';


const SIZE_RE = /(\d+)x(\d+)/;


var getDevices = promisify(viewport);

function parseSize (sizeDescription) {
    var match = SIZE_RE.exec(sizeDescription);

    if (!match)
        return null;

    var portraitWidth  = Number(match[1]);
    var landscapeWidth = Number(match[2]);

    if (Number.isNaN(portraitWidth) || Number.isNaN(landscapeWidth))
        return null;

    return { portraitWidth, landscapeWidth };
}

async function getDeviceSize (deviceName) {
    var devices = await getDevices([deviceName]);

    var size = null;

    while (devices.length && !size)
        size = parseSize(devices.shift().size);

    return size;
}

export async function isDeviceSupported (device) {
    var size = await getDeviceSize(device);

    return !!size;
}

export async function parseRequestedSize (args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number')
        return { width: args[0], height: args[1] };


    var size = await getDeviceSize(args[0]);

    if (!size)
        throw new Error(getText(MESSAGES.deviceSizeAliasNotFound, args[0]));

    return args[1] === 'portrait' ?
           { width: size.portraitWidth, height: size.landscapeWidth } :
           { width: size.landscapeWidth, height: size.portraitWidth };

}

