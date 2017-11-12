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
    }

    process(name, value) {
        if (this[name]) {
            this[name](value);
        }
    }

    shader(value) {
        this.glElement.setShader(value);
    }
}

export default GLAttributesProcessor;