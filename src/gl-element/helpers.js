/*
 * GLElementHelper is a part of HTML GL library
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var constants = require('../constants');
var utils = require('../utils/index');

module.exports = {
    shouldBeGLNode: function (node) {
        //Checks if node should be converted to GL one.
        var styleObject = window.getComputedStyle(node);

        if (styleObject.transform !== 'none') {
            return true;
        }
    },
    isGLNode: function (node) {
        return node[constants.GL_ELEMENT_PROPERTY_NAME];
    },
    getGLParent: function (glElement) {
        var parent = glElement.node || glElement;

        while (parent) {
            parent = parent.parentNode || parent.defaultView.frameElement;

            if (parent && parent[constants.GL_ELEMENT_PROPERTY_NAME]) {
                return parent[constants.GL_ELEMENT_PROPERTY_NAME];
            } else if (parent === window.document) {
                return null;
            }
        }
    },
    getTransformObject(glElement) {
        if (glElement.settings && glElement.settings.heavyDiff) {
            return utils.getTransformObjectFromString(glElement.styleObject.transform);
        } else {
            return utils.getTransformObjectFromPropertiesString(glElement.styleObject.transform);
        }
    }
};