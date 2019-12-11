export default function (variableName) {
    const key = Object.keys(process.env).find(name => name.toLowerCase() === variableName.toLowerCase());

    return process.env[key];
}
