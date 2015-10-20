import BINARIES from './binaries';


const ALIASES = {
    'ie': {
        nameRe: /ie|internet explorer/i,
        cmd:    ''
    },

    'ff': {
        nameRe:             /firefox|mozilla/i,
        cmd:                '-new-window',
        macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}'
    },

    'chrome': {
        nameRe:             /chrome/i,
        cmd:                '--new-window',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}'
    },

    'chromium': {
        nameRe:             /chromium/i,
        cmd:                '--new-window',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}'
    },

    'opera': {
        nameRe:             /opera/i,
        cmd:                '--new-window',
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}'
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
