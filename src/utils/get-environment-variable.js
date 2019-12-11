function getEnvironmentVariableName (source) {
    const names = Object.keys(process.env);

    return names.find(name => name === source) || names.find(name => name.toLowerCase() === source.toLowerCase());
}

export default function (name) {
    return process.env[getEnvironmentVariableName(name)];
}
