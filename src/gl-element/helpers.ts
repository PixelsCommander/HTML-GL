import { getTransformObjectFromString, getTransformObjectFromPropertiesString } from '../utils/index';
import {GL_ELEMENT_PROPERTY_NAME} from "../constants";
import GLElement from "./GLElement";

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

export function isGLNode(node): boolean {
    return node[GL_ELEMENT_PROPERTY_NAME];
}

export function getGLElement(node): GLElement {
    return node[GL_ELEMENT_PROPERTY_NAME];
}

export function getGLParent(glElement: Node): GLElement {
    let parent = glElement;

    while (parent) {
        parent = parent.parentNode || parent.ownerDocument;

        if (parent && parent[GL_ELEMENT_PROPERTY_NAME]) {
            return parent[GL_ELEMENT_PROPERTY_NAME];
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

        if (parent && parent[GL_ELEMENT_PROPERTY_NAME]) {
            result = parent[GL_ELEMENT_PROPERTY_NAME];
        }
    }

    return result;
}

export function getGLChildren(glElement: GLElement): Array<GLElement> {
    // @ts-ignore
    return Array.from(glElement.node.querySelectorAll('html-gl')).map(element => element.GLElement);
}

export function getTransformObject(glElement) {
    if (glElement.settings && glElement.settings.heavyDiff) {
        return getTransformObjectFromString(glElement.styleObject.transform);
    } else {
        return getTransformObjectFromPropertiesString(glElement.styleObject.transform);
    }
}
