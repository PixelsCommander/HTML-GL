/*
 * GLElementHelper is a part of HTML GL library
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

import constants from '../constants';
import * as utils from '../utils/index';

export function isStyleMutation(mutation) {
    if (mutation.attributeName === 'style') {
        return true;
    }
}

export function shouldBeGLNode(node) {
    //Checks if node should be converted to GL one.
    var styleObject = window.getComputedStyle(node);

    if (styleObject.transform !== 'none') {
        return true;
    }
}

export function isGLNode(node) {
    return node[constants.GL_ELEMENT_PROPERTY_NAME];
}

export function getGLElement(node) {
    return node[constants.GL_ELEMENT_PROPERTY_NAME];
}

export function getGLParent(glElement) {
    var parent = glElement.node || glElement;

    while (parent) {
        parent = parent.parentNode || parent.defaultView.frameElement;

        if (parent && parent[constants.GL_ELEMENT_PROPERTY_NAME]) {
            return parent[constants.GL_ELEMENT_PROPERTY_NAME];
        } else if (parent === window.document) {
            return null;
        }
    }
}

export function getGLRoot(glElement) {
    var parent = glElement.node || glElement;
    var result = glElement;

    while (parent) {
        parent = parent.parentNode || parent.defaultView.frameElement;

        if (parent && parent[constants.GL_ELEMENT_PROPERTY_NAME]) {
            result = parent[constants.GL_ELEMENT_PROPERTY_NAME];
        }
    }

    return result;
}

export function getTransformObject(glElement) {
    if (glElement.settings && glElement.settings.heavyDiff) {
        return utils.getTransformObjectFromString(glElement.styleObject.transform);
    } else {
        return utils.getTransformObjectFromPropertiesString(glElement.styleObject.transform);
    }
}