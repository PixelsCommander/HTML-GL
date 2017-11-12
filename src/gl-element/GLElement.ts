/*
 * GLElement is a part of HTML GL library describing single HTML-GL element
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 *
 * Please, take into account:
 * - updateTexture is expensive
 * - updateTransform is cheap
 */

import IGLRenderer from '../renderers/IGLRenderer';
import { GLContext, getCurrentContext } from '../GLContext';
import { BoundingRect, TransformObject } from '../types';
import GLObserver from './GLObserver';
import * as updaters from './updaters';
import * as helpers from './helpers';
import constants from '../constants';
import * as utils from '../utils/';
import GLAttributesProcessor from './GLAttributesProcessor';
import * as ImagesLoaded from '../utils/images-loaded';

const JQ_PLUGIN_NAME = 'htmlgl';

export class GLElement {
    public settings: any = {};

    public context: GLContext;
    public node:HTMLElement;
    public parent: GLElement;
    public observer: GLObserver;

    public displayObject: any;
    public opacity: number;
    public scale: number;
    public boundingRect: BoundingRect = new BoundingRect();
    public transformObject: TransformObject = new TransformObject();
    private isChanged: boolean = false;
    private rasterizing: boolean = false;
    private updaters = updaters;
    private attributesProcessor: GLAttributesProcessor;

    private shader: string;

    constructor(node, settings: any) {
        if (!node) throw('HTML node is not specified for GLElement');

        this.scale = this.settings.scale || constants.GL_SCALE;

        this.context = getCurrentContext();

        this.setNode(node);
        this.observer = new GLObserver(this);
        this.displayObject = this.context.renderer.createDisplayObject(this);
        this.initParent();

        //Debouncing rendering
        this.updateTexture = utils.debounce(this.updateTexture, 500, false);

        this.attributesProcessor = new GLAttributesProcessor(this);
        this.updateTimeInShader = this.updateTimeInShader.bind(this);

        //Initial update
        // @ts-ignore
        new ImagesLoaded(this.node).then(() => {
                //Children should be processed before rendering to know which nodes to igonre when rasterizing
                var children = utils.getNodeChildren(this.node);
                children.forEach((child) => {
                    GLElement.processChildren(child, this);
                });

                //console.log('Images ready', this.node);
                this.update('boundingRect');
                this.update('updateStyles');

                //console.log('Updating texture for ', this.node);
                var updateTexturePromise = this.update('texture');

                updateTexturePromise.then(() => {
                    console.log(1);
                    if (this.settings.oninitialized && this.settings.oninitialized instanceof Function) {
                        this.settings.oninitialized.apply(this);
                    }
                });
            }
        )

        this.syncTransform();

        getCurrentContext().elements.push(this);
    }

    addChild(glElement) {
        this.context.renderer.addTo(this, glElement);
    }

    removeChild(glElement) {
        this.context.renderer.removeFrom(this, glElement);
        glElement.dispose();
    }

    setNode(node) {
        this.node = node;
        node[constants.GL_ELEMENT_PROPERTY_NAME] = this;
        node.setAttribute(constants.GL_RENDERER_ATTRIBUTE_NAME, constants.GL_RENDERER_ATTRIBUTE_VALUE);
    }

    hideDOM() {
        if (this.node.style.opacity !== "0") {
            this.node.style.opacity = "0";
            // this.node.style.visibility = 'hidden';
        }
    }

    initParent() {
        this.parent = helpers.getGLParent(this);
        if (this.parent) {
            this.parent.addChild(this);
        } else {
            this.context.renderer.addTo(null, this);
        }
    }

    markAsChanged() {
        this.isChanged = true;
        requestAnimationFrame(this.syncTransform);

        //getCurrentContext().renderer.markStageAsChanged();
    }

    syncTransform = () => {
        if (this.isChanged) {

            //Composing element page coordinates with transforms
            var composedTransform = {
                translateX: this.transformObject.translateX + this.boundingRect.left,
                translateY: this.transformObject.translateY + this.boundingRect.top,
                translateZ: this.transformObject.translateZ,
                scaleX: this.transformObject.scaleX,
                scaleY: this.transformObject.scaleY,
                scaleZ: this.transformObject.scaleZ,
                rotateX: this.transformObject.rotateX,
                rotateY: this.transformObject.rotateY,
                rotateZ: this.transformObject.rotateZ
            };

            //Updating display object transforms
            this.context.renderer.setTransform(this, composedTransform);

            //Updating opacity
            this.context.renderer.setOpacity(this, this.opacity);

            this.isChanged = false;
        }
    }

    get styleObject() {
        return this.observer.styleObserver.styleObject;
    }

    update(updaterName, styleObject?) {
        if (this.updaters[updaterName]) {

            console.log('Updating ' + updaterName + ' on ' + this.node.tagName + '-' + (this.node.id + this.node.className));
            return this.updaters[updaterName].apply(this, [styleObject]);
        }
    }

    updateTexture() {
        return this.update('texture');
    }

    onTextureRendered(imageData) {
        this.context.renderer.setTexture(this, imageData);
        this.rasterizing = false;
        this.hideDOM();
        console.log('Finished rendering', this.node);
    }

    setShader(shaderCode) {
        if (!shaderCode || !shaderCode.length) {
            this.context.renderer.setShader(this, null);
            this.shader = null;
        } else {
            this.context.renderer.setShader(this, shaderCode);
            this.shader = shaderCode;
            this.updateTimeInShader();
        }
    }

    updateTimeInShader() {
        if (this.shader) {
            requestAnimationFrame(this.updateTimeInShader);
            this.context.renderer.updateUniform(this, 'uTime', performance.now());
        }
    }

    static processChildren(node, rootGLElement) {
        if (!utils.isHTMLNode(node)) {
            return;
        }

        var createdElement = false;

        //Iterate and create glNodes if should be created
        if (helpers.shouldBeGLNode(node)) {
            if (!helpers.isGLNode(node)) {
                new GLElement(node, rootGLElement.settings);
                createdElement = true;
            } else {
                node.GLElement.update('boundingRect');
                node.GLElement.update('transform');
            }
        }

        if (!createdElement && (node.children.length > 0 || node.tagName === 'IFRAME')) {

            var children = utils.getNodeChildren(node);
            children.forEach((child) => {
                GLElement.processChildren(child, rootGLElement);
            });
        }
    }

    dispose() {
        this.node = null;
        this.parent = null;
        this.context = null;
        this.displayObject = null;
        this.observer.dispose();
    }
}

class GLHTMLElement extends HTMLDivElement {
    attachedCallback () {
        new GLElement(this, {
            heavyDiff: true,
        });
    }

    attributeChangedCallback(attributeName, data, value) {
        if (this[constants.GL_ELEMENT_PROPERTY_NAME] && this[constants.GL_ELEMENT_PROPERTY_NAME].attributesProcessor) {
            this[constants.GL_ELEMENT_PROPERTY_NAME].attributesProcessor.process(attributeName, value);
        }
    }
}

//Wrap to jQuery plugin
const jQuery = (<any>window).jQuery;
if (jQuery !== undefined) {
    jQuery[JQ_PLUGIN_NAME] = {};
    jQuery[JQ_PLUGIN_NAME].elements = [];

    jQuery.fn[JQ_PLUGIN_NAME] = function () {
        return this.each(function () {
            if (!jQuery.data(this, 'plugin_' + JQ_PLUGIN_NAME)) {
                var htmlGLobj = new GLElement(this, {
                    heavyDiff: true,
                });

                jQuery.data(this, 'plugin_' + JQ_PLUGIN_NAME, htmlGLobj);
                jQuery[JQ_PLUGIN_NAME].elements.push(htmlGLobj);
            }
        });
    };
}

// @ts-ignore
document.registerElement('html-gl', {
    prototype: GLHTMLElement.prototype
})

// Here for testing purposes
var GLHTMLElementOld = Object.create(HTMLElement.prototype);

GLHTMLElementOld.attachedCallback = function () {
    this.style.opacity = 0;
    this.style.visibility = "hidden";
}

// @ts-ignore
document.registerElement('old-html-gl', {
    prototype: GLHTMLElementOld
})

export default GLElement;