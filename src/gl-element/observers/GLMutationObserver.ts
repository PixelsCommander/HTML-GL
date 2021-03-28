/*
 * GLMutationObserver is a part of HTML GL library listening for DOM motations on HTML element
 * and reflecting this changes on GLElement
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

import { } from '../../utils/index';
import { isGLNode, getGLParent } from '../helpers';
import GLElement from '../GLElement';

export class GLMutationObserver {

    private node: HTMLElement;
    private glElement: GLElement;
    private observer: MutationObserver;
    private callback: Function;

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
            var mutatedNode = mutation.target;

            /*if (mutation.addedNodes.length) {
                mutatedNode = mutation.addedNodes[0];
            } else if (mutation.removedNodes.length) {
                mutatedNode = mutation.removedNodes[0];
            }*/

            var isMe = mutatedNode == self.node;
            var isNotGLNode = !isGLNode(mutatedNode);
            var iAmGLParent = getGLParent(mutatedNode) === self.glElement;

            return isMe || (iAmGLParent && isNotGLNode);
        });

        if (mutations.length) {
            this.callback(mutations);
        }
    }

    dispose() {
        this.glElement = null;
        this.node = null;
        this.callback = null;
        this.observer.disconnect();
        this.observer = null;
    }
}

export default GLMutationObserver;