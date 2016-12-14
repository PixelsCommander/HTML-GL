var rasterizeHTML = require('rasterizehtml');

var rasterizer = {
    rasterize: function(glElement) {
        return rasterizeHTML.drawHTML(glElement.node.outerHTML, undefined, {
            width: glElement.boundingRect.width,
            height: glElement.boundingRect.height
        }).then((e) => e.image);
    }
};

module.exports = rasterizer;