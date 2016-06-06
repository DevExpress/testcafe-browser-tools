import getDeviceSize from './get-device-size';


/**
 * Checks if the provided string is a valid device name contained in the screen size database.
 * @function
 * @name isValidDeviceName
 * @param {string} inputString - The string to be validated.
 */
export default function (inputString) {
    return !!getDeviceSize(inputString);
}
