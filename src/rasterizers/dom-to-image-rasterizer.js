var domToImage = require('dom-to-image');

var rasterizer = {
    rasterize: function(glElement) {
        return domToImage.draw(glElement.node, {
            /* width: glElement.boundingRect.width,
            height: glElement.boundingRect.height*/
        });
    }
};

module.exports = rasterizer;