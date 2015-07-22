import viewport from 'viewport-list';
import Promise from 'promise';


const SIZE_RE = /(\d+)x(\d+)/;


var getViewports = Promise.denodeify(viewport);

function parseSize (sizeDescription) {
    var match = SIZE_RE.exec(sizeDescription);

    if (!match)
        return null;

    var portraitWidth  = Number(match[1]);
    var landscapeWidth = Number(match[2]);

    if (Number.isNaN(portraitWidth) || Number.isNaN(landscapeWidth))
        return null;

    return { portraitWidth, landscapeWidth };
}

export default async function (viewportQuery) {
    var viewports = await getViewports([viewportQuery]);

    return viewports.map(item => {
        var size = parseSize(item.size);

        return size ?
               { portraitWidth: size.portraitWidth, landscapeWidth: size.landscapeWidth, deviceName: item.name } :
               null;
    }).filter(item => item !== null);
}

