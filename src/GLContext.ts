/*
 * This is a part of HTML GL library
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

import GLElement from './gl-element/GLElement';
import IGLRenderer from './renderers/IGLRenderer';
import GLInteractionController from './GLInteractionController';
import * as utils from './utils/index';

export function getCurrentContext(): GLContext {
    return (<any>window).HTMLGL;
}

export class GLContext {

    public enabled = true;
    public elements: Array<GLElement> = [];
    public renderer: IGLRenderer;
    public rasterizer: (GLElement) => Promise<any>;
    public scene: any;
    public document: any;
    public camera: any;
    public isChanged: boolean = false;
    private shouldCreateStage = true;
    private interactionController: GLInteractionController = null;

    public scrollX = 0;
    public scrollY = 0;

    constructor(renderer, rasterizer, shouldCreateStage) {
        (<any>window).HTMLGL = this;

        this.shouldCreateStage = shouldCreateStage;

        this.setRenderer(renderer);
        this.setRasterizer(rasterizer);

        // @ts-ignore
        utils.waitForDocumentLoaded()
            .then(this.initInteraction.bind(this));
    }

    initInteraction() {
        this.interactionController = new GLInteractionController(document.body);
    }

    setRasterizer(rasterizer) {
        this.rasterizer = rasterizer;
    }

    setRenderer(Renderer) {
        this.renderer = new Renderer();
    }

    getPixelRatio() {
        return (<any>window).devicePixelRatio || 1;
    }

    createElement(node, settings) {
        return new GLElement(node, settings);
    }

    disable() {
        this.enabled = true;
    }

    enable() {
        this.enabled = false;
    }
}

export default GLContext;