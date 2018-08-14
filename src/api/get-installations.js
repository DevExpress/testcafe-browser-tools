import Promise from 'pinkie';
import OS from 'os-family';
import which from 'which-promise';
import exists from '../utils/fs-exists-promised';
import { exec, execWinShellUtf8 } from '../utils/exec';
import ALIASES from '../aliases';


// Installation info cache
var installationsCache = null;


// Find installations for different platforms
async function addInstallation (installations, name, instPath) {
    var fileExists = await exists(instPath);

    if (fileExists) {
        Object.keys(ALIASES).some(alias => {
            var { nameRe, cmd, macOpenCmdTemplate, path } = ALIASES[alias];

            if (nameRe.test(name)) {
                installations[alias] = { path: path || instPath, cmd, macOpenCmdTemplate };
                return true;
            }

            return false;
        });
    }
}

async function detectMicrosoftEdge () {
    var regKey = 'HKCU\\Software\\Classes\\ActivatableClasses';
    var stdout = await execWinShellUtf8(`@echo off & reg query ${regKey} /s /f MicrosoftEdge /k && echo SUCCESS || echo FAIL`);

    return /SUCCESS/.test(stdout) ? ALIASES['edge'] : null;
}

async function searchInRegistry (registryRoot) {
    var installations = {};
    var regKey        = registryRoot + '\\SOFTWARE\\Clients\\StartMenuInternet';
    var regKeyEsc     = regKey.replace(/\\/g, '\\\\');
    var browserRe     = new RegExp(regKeyEsc + '\\\\([^\\\\]+)\\\\shell\\\\open\\\\command' +
        '\\s+(?:\\([^)]+\\)|<.*?>)\\s+reg_sz\\s+([^\n]+)\n', 'gi');

    // NOTE: To get the correct result regardless of the Windows localization,
    // we need to run the command using the UTF-8 codepage.
    var stdout = await execWinShellUtf8(`reg query ${regKey} /s`);

    for (var match = browserRe.exec(stdout); match; match = browserRe.exec(stdout)) {
        var name = match[1].replace(/\.exe$/gi, '');

        var path = match[2]
            .replace(/"/g, '')
            .replace(/\\$/, '')
            .replace(/\s*$/, '');

        await addInstallation(installations, name, path);
    }

    return installations;
}

async function findWindowsBrowsers () {
    var machineRegisteredBrowsers = await searchInRegistry('HKEY_LOCAL_MACHINE');
    var userRegisteredBrowsers    = await searchInRegistry('HKEY_CURRENT_USER');
    var installations             = Object.assign(machineRegisteredBrowsers, userRegisteredBrowsers);
    var edgeAlias                 = await detectMicrosoftEdge();

    if (edgeAlias)
        installations['edge'] = edgeAlias;

    return installations;
}

async function findMacBrowsers () {
    var installations = {};

    // NOTE: replace the space symbol with code, because grep splits strings by space.
    var stdout = await exec('ls "/Applications/" | grep -E "Chrome|Firefox|Opera|Safari|Chromium" | sed -E "s/ /032/"');

    await Promise.all(stdout
        .split('\n')
        .filter(fileName => !!fileName)
        .map(fileName => {
            // NOTE: restore space
            fileName = fileName.replace(/032/g, ' ');

            var name = fileName.replace(/.app$/, '');
            var path = `/Applications/${fileName}`;

            return addInstallation(installations, name, path);
        }));

    return installations;
}

async function findLinuxBrowsers () {
    var installations = {};

    var aliasCheckingPromises = Object
        .keys(ALIASES)
        .map(name => {
            var { linuxBinaries } = ALIASES[name];

            if (!linuxBinaries)
                return null;

            var detectionPromises = linuxBinaries
                .map(binary => {
                    return which(binary)
                        .then(path => addInstallation(installations, name, path))
                        .catch(() => {
                            // NOTE: binary not found, just do nothing
                            return;
                        });
                });

            return Promise.all(detectionPromises);
        });

    await Promise.all(aliasCheckingPromises);

    return installations;
}

async function findBrowsers () {
    if (OS.win)
        return await findWindowsBrowsers();

    if (OS.mac)
        return await findMacBrowsers();

    if (OS.linux)
        return await findLinuxBrowsers();
}


// API
/** @typedef {Object} BrowserInfo
 * @description Object that contains information about the browser installed on the machine.
 * @property {string|undefined} path - The path to the executable file that starts the browser.
 *  Required on MacOS machines. On Windows machines, it is used when the winOpenCmdTemplate property is undefined.
 * @property {string} cmd - Additional command line parameters.
 * @property {string} macOpenCmdTemplate - A [Mustache template](https://github.com/janl/mustache.js#templates)
 *  that provides parameters for launching the browser on a MacOS machine.
 * @property {string|undefined} winOpenCmdTemplate - A [Mustache template](https://github.com/janl/mustache.js#templates)
 *  that provides parameters for launching the browser on a Windows machine.  If undefined, the path to the
 *  executable file specified by the path property is used.
 * @example
 *  {
 *       path: 'C:\\ProgramFiles\\...\\firefox.exe',
 *       cmd: '-new-window',
 *       macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}'
 *  }
 */

/**
 * Returns the list of the {@link BrowserInfo} objects that contain information about the browsers installed on the machine.
 * @function
 * @async
 * @name getInstallations
 * @returns {Object.<string, BrowserInfo>} List of the {@link BrowserInfo} objects
 *   containing information about the browsers installed on the machine.
 * @example
 * {
 *   chrome: {
 *       path: 'C:\\ProgramFiles\\...\\chrome.exe',
 *       cmd: '--new-window',
 *       macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}'
 *   },
 *
 *   firefox: {
 *       path: 'C:\\ProgramFiles\\...\\firefox.exe',
 *       cmd: '-new-window',
 *       macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}'
 *   }
 * }
 */
export default async function () {
    if (!installationsCache)
        installationsCache = await findBrowsers();

    return installationsCache;
}
