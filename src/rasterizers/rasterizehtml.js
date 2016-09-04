var rasterizeHTML = require('rasterizehtml');

var rasterizer = {
    rasterize: function(size, node) {
        return rasterizeHTML.drawHTML(node.innerHTML, undefined, {
            width: size.width,
            height: size.height
        });
    }
};

module.exports = rasterizer;