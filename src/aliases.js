import path from 'path';
import BINARIES from './binaries';


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
        cmd:                '--disable-infobars --disable-session-crashed-bubble --no-first-run --new-window',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['google-chrome-canary']
    },

    'chrome': {
        nameRe:             /chrome/i,
        cmd:                '--disable-infobars --disable-session-crashed-bubble --no-first-run --new-window',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['google-chrome', 'google-chrome-stable', 'google-chrome-unstable']
    },

    'chromium': {
        nameRe:             /chromium/i,
        cmd:                '--disable-infobars --disable-session-crashed-bubble --no-first-run --new-window',
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
        path:               BINARIES.open,
        macOpenCmdTemplate: '/usr/bin/osascript "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}'
    },

    'edge': {
        nameRe:             /edge/i,
        cmd:                '',
        winOpenCmdTemplate: 'start microsoft-edge:"{{{pageUrl}}}"'
    }
};

export default ALIASES;
