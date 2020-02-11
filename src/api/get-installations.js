import OS from 'os-family';
import which from 'which-promise';
import { merge } from 'lodash';
import exists from '../utils/fs-exists-promised';
import { exec, execPowershell } from '../utils/exec';
import findAlias from '../utils/find-alias';
import unquote from '../utils/unquote';
import ALIASES from '../aliases';

const MICROSOFT_EDGE_CLASS      = 'Microsoft.MicrosoftEdge';
const MICROSOFT_EDGE_KEY_GLOB   = `HKCU\\Software\\Classes\\ActivatableClasses\\Package\\${MICROSOFT_EDGE_CLASS}*`;
const BROWSER_COMMANDS_KEY_GLOB = root => `${root}\\Software\\Clients\\StartMenuInternet\\*\\shell\\open\\command`;

const MACOS_GET_BROWSER_LIST_COMMAND = 'ls "/Applications/" | grep -E "Chrome|Firefox|Opera|Safari|Chromium|Edge" | sed -E "s/ /032/"';

const LINE_WRAP        = '\r\n';
const DOUBLE_LINE_WRAP = LINE_WRAP + LINE_WRAP;

const REGISTRY_BROWSER_PATH_PROPERTY = '(default)';
const REGISTRY_BROWSER_NAME_PROPERTY = 'PSPath';
const REGISTRY_PROPERTIES_RE         = /^(\(default\)|PSPath)\s*:\s*(.+)$/;

const MAX_OUTPUT_WIDTH = 2 ** 31 - 1;

const POWERSHELL_PIPE_SYMBOL = '|';

const GET_REGISTRY_KEY_COMMAND          = key => `Get-Item 'Registry::${key}'`;
const GET_BROWSER_PATH_PROPERTY_COMMAND = `Get-ItemProperty -Name '${REGISTRY_BROWSER_PATH_PROPERTY}'`;
const FORMAT_BROWSER_INFO_COMMAND       = `Format-List -Property '${REGISTRY_BROWSER_PATH_PROPERTY}','${REGISTRY_BROWSER_NAME_PROPERTY}'`;
const LIMIT_OUTPUT_WIDTH_COMMAND        = `Out-String -Width ${MAX_OUTPUT_WIDTH}`;

// NOTE: We have to use Write-Host for compatibility with PowerShell 2.0
const WRITE_HOST_COMMAND = 'Write-Host';

const GET_REGISTRY_BROWSER_PROPERTIES_COMMAND = key => [
    GET_REGISTRY_KEY_COMMAND(key),
    GET_BROWSER_PATH_PROPERTY_COMMAND,
    FORMAT_BROWSER_INFO_COMMAND,
    LIMIT_OUTPUT_WIDTH_COMMAND,
    WRITE_HOST_COMMAND
].join(POWERSHELL_PIPE_SYMBOL);

// Installation info cache
var installationsCache = null;

async function getRegistryKey (regKeyGlob) {
    return execPowershell(GET_REGISTRY_KEY_COMMAND(regKeyGlob));
}

async function getRegistryBrowserProperties (regKeyGlob) {
    return execPowershell(GET_REGISTRY_BROWSER_PROPERTIES_COMMAND(regKeyGlob));
}

// Find installations for different platforms
async function addInstallation (installations, key, instPath) {
    if (!await exists(instPath))
        return;

    const detectedAlias = findAlias(key);

    if (!detectedAlias)
        return;

    const { name, alias: { cmd, macOpenCmdTemplate, path } }  = detectedAlias;

    installations[name] = { path: path || instPath, cmd, macOpenCmdTemplate };
}

async function detectMicrosoftEdgeLegacy () {
    const registryResult = await getRegistryKey(MICROSOFT_EDGE_KEY_GLOB);

    if (registryResult.stdout.includes(MICROSOFT_EDGE_CLASS))
        return ALIASES['edge-legacy'];

    return null;
}

async function searchInRegistry (registryRoot) {
    const installations  = {};
    const registryResult =  await getRegistryBrowserProperties(BROWSER_COMMANDS_KEY_GLOB(registryRoot));

    const data = registryResult.stdout
        .split(DOUBLE_LINE_WRAP)
        .map(block => block
            .split(LINE_WRAP)
            .map(line => line.match(REGISTRY_PROPERTIES_RE))
            .filter(match => !!match)
            .map(match => ({
                [match[1]]: unquote(match[2])
            }))
        )
        .filter(block => block && block.length)
        .map(block => merge(...block));

    await Promise.all(data.map(record => addInstallation(installations, record[REGISTRY_BROWSER_NAME_PROPERTY], record[REGISTRY_BROWSER_PATH_PROPERTY])));

    return installations;
}

async function findWindowsBrowsers () {
    const machineRegisteredBrowsers = await searchInRegistry('HKEY_LOCAL_MACHINE');
    const userRegisteredBrowsers    = await searchInRegistry('HKEY_CURRENT_USER');
    const installations             = Object.assign(machineRegisteredBrowsers, userRegisteredBrowsers);
    const edgeLegacy                = await detectMicrosoftEdgeLegacy();

    if (edgeLegacy)
        installations['edge-legacy'] = edgeLegacy;

    if (edgeLegacy && !installations['edge'])
        installations['edge'] = edgeLegacy;

    return installations;
}

async function findMacBrowsers () {
    var installations = {};

    // NOTE: replace the space symbol with code, because grep splits strings by space.
    var stdout = await exec(MACOS_GET_BROWSER_LIST_COMMAND);

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

    return {};
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
