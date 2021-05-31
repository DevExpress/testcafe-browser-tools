import path from 'path';
import BINARIES from './binaries';

const chromiumCmdArgs = [
    '--disable-infobars',
    '--disable-session-crashed-bubble',
    '--no-first-run',
    '--new-window',
    '--disable-background-networking',
    '--disable-ipc-flooding-protection',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--autoplay-policy=no-user-gesture-required'
].join(' ');

const edgeCmdArgs = [
    '--new-window',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows'
].join(' ');

const ALIASES = {
    'ie': {
        nameRe: /iexplore|internet explorer/i,
        cmd:    ''
    },

    'firefox': {
        nameRe:             /firefox|mozilla/i,
        cmd:                `-override "${path.join(__dirname, '../data/override.ini')}" -new-window`,
        macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}',
        linuxBinaries:      ['firefox']
    },

    'chrome-canary': {
        nameRe:             /chrome\s*canary/i,
        cmd:                chromiumCmdArgs,
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['google-chrome-canary']
    },

    'chrome': {
        nameRe:             /chrome/i,
        cmd:                chromiumCmdArgs,
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['google-chrome', 'google-chrome-stable', 'google-chrome-unstable']
    },

    'chromium': {
        nameRe:             /chromium/i,
        cmd:                chromiumCmdArgs,
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['chromium-browser', 'chromium']
    },

    'opera': {
        nameRe:             /opera/i,
        cmd:                '--new-window',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['opera']
    },

    'safari': {
        nameRe:             /safari/i,
        cmd:                '',
        path:               BINARIES.app,
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args /dev/null open {{{pageUrl}}} {{{cmd}}}'
    },

    'edge': {
        nameRe:             /edge/i,
        cmd:                edgeCmdArgs,
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['microsoft-edge']
    },

    'edge-legacy': {
        cmd:                '',
        winOpenCmdTemplate: 'start microsoft-edge:"{{{pageUrl}}}"'
    }
};

export default ALIASES;
