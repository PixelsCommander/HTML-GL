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

class GLElement {

    constructor(node, settings) {

        if (!node) throw('HTML node is not specified for GLElement');

        console.log(`Creating GLElement on node with innerHTML=${node.innerHTML}`);

        this.processChildren = GLElement.processChildren;

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
        this.updateTexture = utils.throttle(this.updateTexture, 500, this);

        //Initial update
        new ImagesLoaded(this.node).then(() => {
                //console.log('Images ready', this.node);
                this.update('boundingRect');
                this.update('updateStyles');

                //Children should be processed before rendering to know which nodes to igonre when rasterizing
                GLElement.processChildren(this.node, this);

                console.log('Updating texture for ', this.node);
                this.updateTexture();
            }
        )

        this.syncTransform = this.syncTransform.bind(this);
        this.syncTransform();
    }

    addChild(glElement) {
        this.renderer.addTo(glElement, this);
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
        requestAnimationFrame(this.syncTransform);
    }

    get styleObject() {
        return this.observer.styleObserver.styleObject;
    }

    update(updaterName, styleObject) {
        if (this.updaters[updaterName]) {
            this.updaters[updaterName].apply(this, [styleObject]);
        }
    }

    updateTexture() {
        var self = this;
        //setTimeout(function () {
            self.update('texture')
        //}, 0);
    }

    onTextureRendered(imageData) {
        this.renderer.setTexture(this, imageData);
        console.log('Finished rendering', this.node);
    }

    static processChildren(node, rootGLElement) {

        if (!utils.isHTMLNode(node)) {
            return;
        }

        //Iterate and create glNodes if condition works
        if (helpers.shouldBeGLNode(node)) {
            if (!helpers.isGLNode(node)) {
                new GLElement(node, rootGLElement.settings);
            } else {
                //node.GLElement.updateTexture();
                node.GLElement.update('transform');
            }
        } else if (node.children.length > 0 || node.tagName === 'IFRAME') {

            var children = [];

            if (node.tagName === 'IFRAME') {

                /* if (!node.contentDocument.body) {
                    node.onload = function(){

                        children = node.contentDocument.body.children;
                        for (var childIndex in children) {
                            var child = children[childIndex];
                            GLElement.processChildren(child, rootGLElement);
                        }
                    }
                    return;
                } else { */
                    children = node.contentDocument.body.children;
                //}
            } else {
                children = node.children;
            }

            for (var childIndex in children) {
                var child = children[childIndex];
                GLElement.processChildren(child, rootGLElement);
            }
        }
    }
}

module.exports = GLElement;