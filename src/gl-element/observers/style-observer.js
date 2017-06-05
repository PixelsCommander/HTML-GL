/*
 * GLStyleObserver is a part of HTML GL library listening for styles changes on HTML element
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var diff = require('object-diff');
var constants = require('../../constants');

class GLStyleObserver {

    //Callback accepts three parameters: diff, prevStyle, nextStyle
    constructor(glElement, callback) {
        this.glElement = glElement;
        this.node = glElement.node;
        this.callback = callback;

        this.styleObject = null;
        this.diff = null;

        this.step = 0;

        this.update = this.update.bind(this);
        this.update();
    }

    update() {
        if (this.glElement) {
            if (this.step === 0) {
                var styleData = {};

                if (this.glElement.settings.heavyDiff) {
                    styleData = this.getStyleData();
                } else {
                    styleData = this.getStyleDataQuick();
                }

                //Cloning object
                var nextStyleObject = JSON.parse(JSON.stringify(styleData));

                //Skip comparsion for first time when oldStyleObject is undefined
                if (this.styleObject) {
                    this.diff = diff(this.styleObject, nextStyleObject);
                }

                this.styleObject = nextStyleObject;

                if (this.diff && Object.keys(this.diff).length) {
                    this.callback(this.diff, this.styleObject, nextStyleObject);
                }
            }

            this.step = this.step < constants.SKIP_FRAMES ? this.step + 1 : 0;

            if (!this.glElement.settings.styleObserverDisabled) {
                requestAnimationFrame(this.update);
            }
        }
    }

    getStyleDataQuick() {
        return this.node.style;
    }

    getStyleData() {
        return window.getComputedStyle(this.node, null);
    }

    dispose() {
        this.glElement = null;
        this.node = null;
        this.callback = null;
    }
}

module.exports = GLStyleObserver;