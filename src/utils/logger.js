import debug from 'debug';
import { inspect } from 'util';

export default class Logger {
    constructor (namespace) {
        this.logger = debug(namespace);
    }

    log (data) {
        try {
            this.logger(inspect(data, { isTestCafeInspect: true, compact: false }));
        }
        catch (e) {
            this.logger(e.stack ? e.stack : String(e));
        }
    }
}
