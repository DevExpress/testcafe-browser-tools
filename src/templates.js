import { inspect } from 'util';
import dedent from 'dedent';


const PROCESS_OUTPUT = ({ output }) => dedent `
    Process output:
    ${output}
`;

export const BASIC_ERROR_MESSAGE = data => dedent `
    An error was thrown.
    Error data:
    ${ inspect(data) }
`;

export const BROWSER_PATH_NOT_SET  = () => dedent `
    Unable to run the browser. The browser path or command template is not specified.
`;

export const UNABLE_TO_RUN_BROWSERS = ({ path }) => dedent `
    Unable to run the browser. The file at ${path} does not exist or is not executable.
`;

export const NATIVE_BINARY_HAS_FAILED = ({ binary, exitCode, output }) => dedent `
    The ${binary} process failed with the ${exitCode} exit code.
    ${ output
        ? PROCESS_OUTPUT({ output })
        : ''
    }
`;

export const UNABLE_TO_ACCESS_AUTOMATION_API = ({ binary }) => dedent `
    Process ${binary} can't access the Automation API.
`;

export const UNABLE_TO_ACCESS_SCREEN_RECORDING_API = ({ binary }) => dedent `
    Process ${binary} can't access the Screen Recording API.
`;
