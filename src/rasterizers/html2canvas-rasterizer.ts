import * as html2canvasCore from '../../../html2canvas/src/core';

export function rasterize(glElement) {
    var scale = 1;
    var width = glElement.boundingRect.width;
    var height = glElement.boundingRect.height;

    // Create scaled canvas
    var scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = width * scale;
    scaledCanvas.height = height * scale;

    scaledCanvas.style.width = width + "px";
    scaledCanvas.style.height = height + "px";

    var scaledContext = scaledCanvas.getContext("2d");

    scaledContext.mozImageSmoothingEnabled = false;
    scaledContext.imageSmoothingEnabled = false;

    // @ts-ignore
    return html2canvasCore(glElement.node, {
        width: width,
        height: height,
        scale: 2
    });
};