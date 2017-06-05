/*
 * This is a part of HTML GL library
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var domtoimageRasterizer = require('./rasterizers/dom-to-image-rasterizer');
var html2canvasRasterizer = require('./rasterizers/html2canvas-rasterizer');
var threeRenderer = require('./renderers/threejs-renderer');
var InteractionController = require('./interaction-controller');
var logger = require('js-logger');

var GLElement = require('./gl-element/');

var GLCore = {
    interactionController: new InteractionController(document.body),
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
    createElement: function (node, settings) {
        return new GLElement(node, settings);
    }
};

window.HTMLGL = GLCore;
module.exports = GLCore;

GLCore.setRasterizer(domtoimageRasterizer);
GLCore.setRenderer(threeRenderer);

logger.useDefaults();
logger.setLevel(logger.WARN);