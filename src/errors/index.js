import * as CODES from './codes';
import * as TEMPLATES from '../templates';

export const CLASSES = {
    [CODES.E001]: BrowserPathNotSetError,
    [CODES.E002]: UnableToRunBrowsersError,
    [CODES.E003]: NativeBinaryHasFailedError,
    [CODES.E004]: UnableToAccessAutomationAPIError,
    [CODES.E005]: UnableToAccessScreenRecordingAPIError
};

export const MESSAGES = {
    [CODES.E001]: TEMPLATES.BROWSER_PATH_NOT_SET,
    [CODES.E002]: TEMPLATES.UNABLE_TO_RUN_BROWSERS,
    [CODES.E003]: TEMPLATES.NATIVE_BINARY_HAS_FAILED,
    [CODES.E004]: TEMPLATES.UNABLE_TO_ACCESS_AUTOMATION_API,
    [CODES.E005]: TEMPLATES.UNABLE_TO_ACCESS_SCREEN_RECORDING_API
};

class BasicError extends Error {
    constructor (data) {
        const [code]  = Object.entries(CLASSES).find(([_, errorClass]) => errorClass === new.target);
        const message = MESSAGES[code](data);

        super(message);

        this.data = data;
        this.code = code;
    }
}

export class BrowserPathNotSetError extends BasicError {
    constructor () {
        super();
    }
}

export class UnableToRunBrowsersError extends BasicError {
    constructor ({ path }) {
        super({ path });
    }
}

export class NativeBinaryHasFailedError extends BasicError {

}

class PermissionsError extends NativeBinaryHasFailedError {

}

export class UnableToAccessAutomationAPIError extends PermissionsError {

}

export class UnableToAccessScreenRecordingAPIError extends PermissionsError {

}

export * as CODES from './codes';
