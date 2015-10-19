export const MESSAGES = {
    browserPathNotSet:       'Unable to run the browser. The browser path or command template is not specified.',
    unableToRunBrowser:      'Unable to run the browser. The file at {path} does not exist or is not executable.',
    unableToFindBrowser:     'Unable to find the browser. "{browser}" is not a browser alias or path to an executable file.',
    deviceSizeAliasNotFound: 'Unable to get the device size. The device "{deviceName}" is not found.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}
