import { readSync } from 'read-file-relative';


const DEVICE_DATABASE = JSON.parse(readSync('../../data/devices.json'));


export default function (deviceName) {
    deviceName = deviceName.toLowerCase().split(' ').join('');

    return DEVICE_DATABASE[deviceName];
}
