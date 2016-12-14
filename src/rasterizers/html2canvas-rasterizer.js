var html2canvas = require('../../../html2canvas/src/core');

var rasterizer = {
    rasterize: function (glElement) {

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
        //scaledContext.scale(scale, scale);

        scaledContext.mozImageSmoothingEnabled = false;
        scaledContext.imageSmoothingEnabled = false;

        return html2canvas(glElement.node, {
            width: width,
            height: height,
            scale: 2
        });
    }
}

module.exports = rasterizer;