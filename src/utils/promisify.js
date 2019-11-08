import Promise from 'pinkie';
import pify from 'pify';


export default function (fn, multiArgs) {
    return pify(fn, { promiseModule: Promise, multiArgs });
}
