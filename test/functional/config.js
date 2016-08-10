var OS = require('os-family');

if (OS.win)
    exports.ALIASES = ['chrome', 'firefox', 'ie'];
else if (OS.mac)
    exports.ALIASES = ['safari'];
else if (OS.linux)
    exports.ALIASES = ['chromium'];
