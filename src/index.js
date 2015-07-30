import * as browserInstallations from './installations';
import open from './open';
import close from './close';
import resize from './resize';
import screenshot from './screenshot';


export default {
    getInstallations: browserInstallations.get,
    open,
    close,
    resize,
    screenshot
};
