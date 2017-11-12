/*
 * This is a part of HTML GL library
 * Copyright (c) 2017 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

import { rasterize as domtoimageRasterizer } from './rasterizers/dom-to-image-rasterizer';
import { rasterize as html2canvasRasterizer } from './rasterizers/html2canvas-rasterizer';
import ThreeGLRenderer from './renderers/threejs/ThreeGLRenderer';
import PixiGLRenderer from './renderers/pixijs/PixiGLRenderer';
import GLContext from './GLContext';

const DEFAULT_RENDERER = 'pixi';
const DEFAULT_RASTERIZER = 'domtoimage';
const DEFAULT_CREATE_STAGE = true;

const w = (<any>window);

w.htmlglnostage = !DEFAULT_CREATE_STAGE;

const renderers = {
    three: ThreeGLRenderer,
    pixi: PixiGLRenderer,
}

const rasterizers = {
    html2canvas: html2canvasRasterizer,
    domtoimage: domtoimageRasterizer,
}

//Checking if renderer and rasterizer are set as attributes on html-gl.js script
const scripts = document.getElementsByTagName('script');
const currentScript = scripts[scripts.length - 1];

const rendererAttribute = currentScript.getAttribute('renderer');
const createStageAttribute = !(currentScript.getAttribute('nostage') == 'true');
const rasterizerAttribute = currentScript.getAttribute('rasterizer');

const shouldCreateStage = !w.htmlglnostage && createStageAttribute || DEFAULT_RENDERER;
const rendererName = w.htmlglrenderer || rendererAttribute || DEFAULT_RENDERER;
const rasterizerName = w.htmlglrasterizer || rasterizerAttribute || DEFAULT_RASTERIZER;

const renderer = renderers[rendererName];
const rasterizer = rasterizers[rasterizerName];

new GLContext(renderer, rasterizer, shouldCreateStage);