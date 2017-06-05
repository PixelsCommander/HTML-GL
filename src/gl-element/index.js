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

var GLObserver = require('./observers');
var updaters = require('./updaters');
var helpers = require('./helpers');
var constants = require('../constants');
var utils = require('../utils/');
var ImagesLoaded = require('../utils/images-loaded');
var logger = require('js-logger');

class GLElement {

    constructor(node, settings) {

        if (!node) throw('HTML node is not specified for GLElement');

        logger.info(`Creating GLElement on node with innerHTML=${node.innerHTML}`);

        this.processChildren = GLElement.processChildren;

        this.rasterizing = false;
        this.settings = settings || {};
        this.parent = {};
        this.boundingRect = {};
        this.displayObject = {};
        this.transformObject = {};
        this.scale = settings.scale || constants.GL_SCALE;

        this.renderer = HTMLGL.renderer;
        this.rasterizer = HTMLGL.rasterizer;
        this.updaters = updaters;

        this.setNode(node);
        this.displayObject = this.renderer.createDisplayObject(this);
        this.initParent();
        this.observer = new GLObserver(this);

        //Throttling rendering
        //this.updateTexture = utils.throttle(this.updateTexture, 500, this);

        //Initial update
        new ImagesLoaded(this.node).then(() => {
                //Children should be processed before rendering to know which nodes to igonre when rasterizing
                var children = utils.getNodeChildren(this.node);
                children.forEach((child) => {
                    GLElement.processChildren(child, this);
                });

                //console.log('Images ready', this.node);
                this.update('boundingRect');
                this.update('updateStyles');

                logger.info('Updating texture for ', this.node);
                var updateTexturePromise = this.updateTexture();

                updateTexturePromise.then(() => {
                    if (this.settings.oninitialized && this.settings.oninitialized instanceof Function) {
                        this.settings.oninitialized.apply(this);
                    }
                });
            }
        )

        this.syncTransform = this.syncTransform.bind(this);
        this.syncTransform();
    }

    addChild(glElement) {
        this.renderer.addTo(this, glElement);
    }

    removeChild(glElement) {
        this.renderer.removeFrom(this, glElement);
        glElement.dispose();
    }

    setNode(node) {
        this.node = node;
        node[constants.GL_ELEMENT_PROPERTY_NAME] = this;

        var rendererAttributeNode = node.ownerDocument.createAttribute(constants.GL_RENDERER_ATTRIBUTE_NAME);
        rendererAttributeNode.value = constants.GL_RENDERER_ATTRIBUTE_VALUE;
        node.setAttributeNode(rendererAttributeNode);
    }

    initParent() {
        this.parent = helpers.getGLParent(this);
        if (this.parent) {
            this.parent.addChild(this);
        }
    }

    markAsChanged() {
        this.isChanged = true;
        requestAnimationFrame(this.syncTransform);
    }

    syncTransform() {
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
            this.renderer.setTransform(this, composedTransform);

            //Updating opacity
            this.renderer.setOpacity(this, this._opacity);

            this.isChanged = false;
        }
    }

    get styleObject() {
        return this.observer.styleObserver.styleObject;
    }

    update(updaterName, styleObject) {
        if (this.updaters[updaterName]) {
            logger.info('Updated ' + updaterName + ' on ' + this.node.tagName + '-' + (this.node.id + this.node.className));
            return this.updaters[updaterName].apply(this, [styleObject]);
        }
    }

    updateTexture() {
        return this.update('texture');
    }

    onTextureRendered(imageData) {
        this.renderer.setTexture(this, imageData);
        this.rasterizing = false;
        logger.info('Finished rendering', this.node);
    }

    static processChildren(node, rootGLElement) {

        logger.info('Processing child ' + node.tagName + '-' + (node.id || node.className));

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
        this.renderer = null;
        this.rasterizer = null;
        this.displayObject = null;
        this.observer.dispose();
    }
}

module.exports = GLElement;