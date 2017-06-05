/*
 * GLUpdater is a part of HTML GL library holding GLElement updating functions
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 *
 * Please, take into account: all functions are executes in GLElement context
 */

var utils = require('../utils/index');
var constants = require('./../constants');
var helpers = require('./helpers');
var GLElement = require('./index');
var objectDiff = require('object-diff');

module.exports = {
    transform: function() {

        //Retreiving transformations data from styles object, usually filled by StyleObserver
        this.transformObject = helpers.getTransformObject(this);

        //Fixing defaults
        this.transformObject.translateX = parseFloat(this.transformObject.translateX) || 0;
        this.transformObject.translateY = parseFloat(this.transformObject.translateY) || 0;
        this.transformObject.translateZ = parseFloat(this.transformObject.translateZ) || 0;
        this.transformObject.scaleX = parseFloat(this.transformObject.scaleX) || 1;
        this.transformObject.scaleY = parseFloat(this.transformObject.scaleY) || 1;
        this.transformObject.scaleZ = parseFloat(this.transformObject.scaleZ) || 1;
        this.transformObject.rotateX = (parseFloat(this.transformObject.rotateX) / 180) * Math.PI || 0;
        this.transformObject.rotateY = (parseFloat(this.transformObject.rotateY) / 180) * Math.PI || 0;
        this.transformObject.rotateZ = (parseFloat(this.transformObject.rotateZ) / 180) * Math.PI || 0;

        this.markAsChanged();
    },
    opacity: function(styleObject) {

        var style = styleObject || this.styleObject;
        this._opacity = parseFloat(style.opacity) || 1;

        this.markAsChanged();
    },
    boundingRect: function() {

        var boundingRect = this.node.getBoundingClientRect();
        var oldBoundingRect = this.boundingRect;

        this.boundingRect = {
            left: boundingRect.left,
            right: boundingRect.right,
            top: boundingRect.top,
            bottom: boundingRect.bottom,
            width: boundingRect.width,
            height: boundingRect.height,
        };

        if (this.parent && this.parent.boundingRect) {
            this.boundingRect.left -= this.parent.boundingRect.left;
            this.boundingRect.top -= this.parent.boundingRect.top;
        }

        if (Object.keys(this.transformObject).length) {
            this.boundingRect.left = parseFloat(this.boundingRect.left) - this.transformObject.translateX;
            this.boundingRect.top = parseFloat(this.boundingRect.top) - this.transformObject.translateY;
        }

        //If size changed then update texture
        var diff = objectDiff(oldBoundingRect, this.boundingRect);
        if (Object.keys(diff).length) {
            this.updateTexture();
        }
    },
    texture: function() {

        this.rasterizing = true;
        //this.update('boundingRect');
        return this.rasterizer.rasterize(this).then(this.onTextureRendered.bind(this));
    },
    children: function() {

        this.processChildren(this.node);
    },
    updateStyles: function() {

        this.update('transform');
        this.update('opacity');
    }
};