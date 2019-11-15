import dedent from 'dedent';


const WHITESPACE    = ' ';
const WHITESPACE_RE = /\s+/g;

export default function (source, ...substitutions) {
    return dedent(source, ...substitutions).replace(WHITESPACE_RE, WHITESPACE);
}
