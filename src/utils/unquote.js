const QUOTE_RE = /["']/;

export default function (string) {
    const start = string[0];
    const end   = string[string.length - 1];

    if (start !== end || !start.match(QUOTE_RE))
        return string;

    return string.slice(1, string.length - 1);
}
