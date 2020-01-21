import { findKey } from 'lodash';
import ALIASES from '../aliases';


export default function (key) {
    const name = findKey(ALIASES, alias => alias.nameRe && alias.nameRe.test(key));

    if (!name)
        return void 0;

    return { name, alias: ALIASES[name] };
}
