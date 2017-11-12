import * as domToImage from 'dom-to-image';

export function rasterize(glElement) {
    return domToImage.draw(glElement.node, {
        width: glElement.boundingRect.width,
        height: glElement.boundingRect.height
    });
}