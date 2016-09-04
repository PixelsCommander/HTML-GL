var rasterizeHTMLRasterizer = require('./rasterizers/rasterizehtml');
var threeRenderer = require('./renderers/threejs');

var GLElement = require('./gl-element');

var GLCore = {
    initialize: function (renderer, rasterizer) {
        this.setRenderer(renderer);
        this.setRasterizer(rasterizer);
    },
    setRasterizer: function (rasterizer) {
        window.HTMLGL.rasterizer = rasterizer;
    },
    setRenderer: function (renderer) {
        window.HTMLGL.renderer = renderer;
    },
    createElement: function (node) {
        return new GLElement(node);
    }
};

window.HTMLGL = GLCore;
module.exports = GLCore;

GLCore.setRasterizer(rasterizeHTMLRasterizer);
GLCore.setRenderer(threeRenderer);