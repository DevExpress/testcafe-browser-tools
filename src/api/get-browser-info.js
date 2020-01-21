import getInstallations from './get-installations';
import exists from '../utils/fs-exists-promised';
import findAlias from '../utils/find-alias';


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

    if (!await exists(browser))
        return null;

    const detectedAlias = findAlias(browser);

    const { cmd, macOpenCmdTemplate } = detectedAlias ? detectedAlias.alias : DEFAULT_ALIAS;

    return { path: browser, cmd, macOpenCmdTemplate };
}
