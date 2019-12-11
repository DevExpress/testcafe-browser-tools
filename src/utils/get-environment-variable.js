import { find } from 'lodash';

function getEnvironmentVariableName (source) {
    const names = Object.keys(process.env);

    return find(names, name => name === source) || find(names, name => name.toLowerCase() === source.toLowerCase());
}

export default function (name) {
    return process.env[getEnvironmentVariableName(name)];
}
