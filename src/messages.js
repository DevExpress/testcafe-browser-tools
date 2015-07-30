export const MESSAGES = {
    browserPathNotSet:       'Unable to run the browser. The browser path is not specified.',
    unableToRunBrowser:      'Unable to run the browser. The file at {path} does not exist or is not executable.',
    deviceSizeAliasNotFound: 'Unable to get device size. Device \'{deviceName}\' is not found.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}
