/*
 * GLAttributesProcessor is a part of HTML GL library
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

import GLElement from './GLElement';

export class GLAttributesProcessor {

    private glElement: GLElement;

    constructor(glElement) {
        this.glElement = glElement;
        const attributes = this.glElement.node.getAttributeNames();
        attributes.forEach(attributeName => this.process(attributeName, this.glElement.node.getAttribute(attributeName)));
    }

    process(name, value) {
        if (this[name]) {
            this[name](value);
        } else {
            this.glElement.settings[name] = value;
        }
    }

    shader(value: string) {
        this.glElement.setShader(value);
    }
}

export default GLAttributesProcessor;
