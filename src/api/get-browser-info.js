import find from 'array-find';
import getInstallations from './get-installations';
import exists from '../utils/fs-exists-promised';
import ALIASES from '../aliases';


//Const
const DEFAULT_ALIAS = {
    cmd:                '',
    macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}}'
};


//API
/**
 * Returns information about the specified browser.
 * @function
 * @async
 * @name getBrowserInfo
 * @param {string} browser - A browser alias ('chrome', 'ff', etc.) or a path to the browser's executable file.
 * @returns {BrowserInfo} An object that contains information about the specified browser.
 */
export default async function (browser) {
    var installations = await getInstallations();

    var browserAsAlias = browser.trim().toLowerCase();

    if (installations[browserAsAlias])
        return installations[browserAsAlias];

    var fileExists = await exists(browser);

    if (!fileExists)
        return null;

    var detectedAlias = find(Object.keys(ALIASES), alias => ALIASES[alias].nameRe.test(browser));

    var { cmd, macOpenCmdTemplate } = detectedAlias ? ALIASES[detectedAlias] : DEFAULT_ALIAS;

    return { path: browser, cmd, macOpenCmdTemplate };
}
