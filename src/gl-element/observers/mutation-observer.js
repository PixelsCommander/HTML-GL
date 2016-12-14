/*
 * GLMutationObserver is a part of HTML GL library listening for DOM motations on HTML element
 * and reflecting this changes on GLElement
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var utils = require('../../utils/index');
var elementHelpers = require('../helpers');

class GLMutationObserver {
    constructor(glElement, callback) {

        this.glElement = glElement;
        this.node = glElement.node;
        this.callback = callback;
        this.initObserver();
    }

    initObserver() {

        var self = this,
            config = {
                childList: true,
                characterData: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style']
            };

        this.observer = this.observer || new MutationObserver(this.onMutation.bind(this));
        this.observer.observe(this.node, config);
    }

    onMutation(mutations) {

        var self = this;

        //Filter out mutations from other GLElements
        mutations = mutations.filter(function(mutation){
            var isMe = mutation.target == self.node;
            var isNotGLNode = !elementHelpers.isGLNode(mutation.target);
            var iAmGLParent = elementHelpers.getGLParent(mutation.target) === self.node;

            return isMe || (iAmGLParent && isNotGLNode);
        });

        if (mutations.length) {
            this.callback(mutations);
        }
    }
}

module.exports = GLMutationObserver;