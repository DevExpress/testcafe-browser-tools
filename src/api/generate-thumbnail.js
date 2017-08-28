import path from 'path';
import ensureDirectory from '../utils/ensure-directory';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


const DEFAULT_THUMBNAIL_WIDTH  = 240;
const DEFAULT_THUMBNAIL_HEIGHT = 130;

function getThumbnailPath (imagePath) {
    var imageName = path.basename(imagePath);
    var imageDir  = path.dirname(imagePath);

    return path.join(imageDir, 'thumbnails', imageName);
}

/**
 * Creates a thumbnail image from the specified PNG image file.
 * @function
 * @async
 * @name generateThumbnail
 * @param {string} sourcePath - Specifies the path to the source image in PNG format.
 * @param {string} thumbnailPath - Specifies the path to the resulting thumbnail image.
 *                                 Defaults to '<sourcePathDirectory>/thumbnails/<sourcePathFileName>'
 * @param {number} width - Specifies the width of the thumbnail image, in pixels (default is 240).
 * @param {number} height - Specifies the height of the thumbnail image, in pixels (default is 130).
 */
export default async function (sourcePath,
                               thumbnailPath = getThumbnailPath(sourcePath),
                               width = DEFAULT_THUMBNAIL_WIDTH,
                               height = DEFAULT_THUMBNAIL_HEIGHT) {
    if (!await ensureDirectory(thumbnailPath))
        return;

    await execFile(BINARIES.generateThumbnail, [sourcePath, thumbnailPath, width, height]);
}
