export const MESSAGES = {
    browserPathNotSet:  'Unable to run the browser. The browser path or command template is not specified.',
    unableToRunBrowser: 'Unable to run the browser. The file at {path} does not exist or is not executable.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}
