import path from 'path';
import BINARIES from './binaries';


const ALIASES = {
    'ie': {
        nameRe: /ie|internet explorer/i,
        cmd:    ''
    },

    'firefox': {
        nameRe:             /firefox|mozilla/i,
        cmd:                `-new-window -override ${path.join(__dirname, '../data/override.ini')}`,
        macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}',
        linuxBinaries:      ['firefox']
    },

    'chrome': {
        nameRe:             /chrome/i,
        cmd:                '--new-window --no-first-run',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}',
        linuxBinaries:      ['google-chrome', 'google-chrome-stable', 'google-chrome-canary']
    },

    'chromium': {
        nameRe:             /chromium/i,
        cmd:                '--new-window --no-first-run',
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
