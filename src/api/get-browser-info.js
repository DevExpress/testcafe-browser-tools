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
 * @param {string} browser - A browser alias ('chrome', 'firefox', etc.) or a path to the browser's executable file.
 * @returns {BrowserInfo} An object that contains information about the specified browser.
 */
export default async function (browser) {
    const installations = await getInstallations();

    const browserAsAlias = browser.trim().toLowerCase();

    if (installations[browserAsAlias])
        return installations[browserAsAlias];

    const fileExists = await exists(browser);

    if (!fileExists)
        return null;

    const detectedAlias = find(Object.keys(ALIASES), key => {
        const alias = ALIASES[key];

        if (alias.nameRe)
            return alias.nameRe.test(browser);

        return false;
    });

    const { cmd, macOpenCmdTemplate } = detectedAlias ? ALIASES[detectedAlias] : DEFAULT_ALIAS;

    return { path: browser, cmd, macOpenCmdTemplate };
}
