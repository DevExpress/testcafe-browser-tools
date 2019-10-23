import * as CODES from './codes';
import * as TEMPLATES from '../templates';


function getErrorCode (errorClass) {
    const code = Object
        .keys(CODES)
        .find(currentCode => CLASSES[currentCode] === errorClass); // eslint-disable-line no-use-before-define

    return code || CODES.E000;
}

function getErrorInfo (errorClass) {
    const code = getErrorCode(errorClass);

    return {
        constructor: CLASSES[code],  // eslint-disable-line no-use-before-define
        message:     MESSAGES[code], // eslint-disable-line no-use-before-define

        code
    };
}

class BasicError extends Error {
    constructor (data = {}) {
        const { code, constructor, message }  = getErrorInfo(new.target);

        super(message(data));

        this.name = constructor.name;
        this.data = data;
        this.code = code;
    }
}

export class BrowserPathNotSetError extends BasicError {

}

export class UnableToRunBrowsersError extends BasicError {
    constructor ({ path }) {
        super({ path });
    }
}

export class NativeBinaryHasFailedError extends BasicError {
    constructor ({ binary, exitCode, output }) {
        super({ binary, exitCode, output });
    }
}

class PermissionError extends NativeBinaryHasFailedError {

}

export class UnableToAccessAutomationAPIError extends PermissionError {

}

export class UnableToAccessScreenRecordingAPIError extends PermissionError {

}

export const MESSAGES = {
    [CODES.E000]: TEMPLATES.BASIC_ERROR_MESSAGE,
    [CODES.E001]: TEMPLATES.BROWSER_PATH_NOT_SET,
    [CODES.E002]: TEMPLATES.UNABLE_TO_RUN_BROWSERS,
    [CODES.E003]: TEMPLATES.NATIVE_BINARY_HAS_FAILED,
    [CODES.E004]: TEMPLATES.UNABLE_TO_ACCESS_AUTOMATION_API,
    [CODES.E005]: TEMPLATES.UNABLE_TO_ACCESS_SCREEN_RECORDING_API
};

export const CLASSES = {
    [CODES.E000]: BasicError,
    [CODES.E001]: BrowserPathNotSetError,
    [CODES.E002]: UnableToRunBrowsersError,
    [CODES.E003]: NativeBinaryHasFailedError,
    [CODES.E004]: UnableToAccessAutomationAPIError,
    [CODES.E005]: UnableToAccessScreenRecordingAPIError
};


export { CODES };
