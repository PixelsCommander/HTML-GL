/*
 * GLObserver is a part of HTML GL library listening for DOM / styles changes and transitions on HTML element
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

import GLMutationObserver from './observers/GLMutationObserver';
import GLStyleObserver from './observers/GLStyleObserver';
import * as helpers from './helpers';
import GLElement from './GLElement';

export class GLObserver {

    public styleObserver: GLStyleObserver;
    public mutationObserver: GLMutationObserver;

    private node: HTMLElement;
    private glElement: GLElement;

    constructor(glElement) {
        this.glElement = glElement;
        this.node = glElement.node;

        this.mutationObserver = new GLMutationObserver(this.glElement, this.onDOMChanged.bind(this));
        this.styleObserver = new GLStyleObserver(this.glElement, this.onStyleChanged.bind(this));
    }

    onDOMChanged(mutations) {
        //console.log('DOM changed', mutations);

        if (!this.glElement.ready) {
            return;
        }

        //If there are style mutations
        if (mutations.filter(helpers.isStyleMutation).length) {

            //If style observer update on RAF disabled we update it from style mutation
            if (this.glElement.settings.styleObserverDisabled) {
                this.styleObserver.update();
            }

            return;
        }

        if (mutations[0].addedNodes.length) {
            this.processAddedNodes(mutations[0].addedNodes);
        }

        if (mutations[0].removedNodes.length) {
            this.processRemovedNodes(mutations[0].removedNodes)
        }

        //Rerender
        this.glElement.updateTexture();
    }

    processAddedNodes(addedNodes) {
        this.glElement.update('children');
    }

    processRemovedNodes(removedNodes) {
        for (var i = 0; i < removedNodes.length; i++) {
            if (helpers.isGLNode(removedNodes[i])) {
                console.log('Processing node removal ' + removedNodes[i]);

                //TODO Move to delayed queue executed after the loop to avoid duplication of updates

                //Reflow from the root
                var GLRootToReflow = helpers.getGLRoot(this.glElement);
                GLRootToReflow.update('children');

                //Actual removal
                var nodeGLElement = helpers.getGLElement(removedNodes[i]);
                this.glElement.removeChild(nodeGLElement);
            }
        }
    }

    onStyleChanged(diff, prevStyle, nextStyle) {
        var diffPropertiesNames = Object.keys(diff);
        this.updateProperties(diffPropertiesNames);
    }

    updateProperties(properties) {
        for (var i = 0; i < properties.length; i++) {
            var propertyName = properties[i];
            this.glElement.update(propertyName);
        }
    }

    dispose() {
        this.glElement = null;
        this.node = null;

        this.mutationObserver.dispose();
        this.styleObserver.dispose();
    }
}

export default GLObserver;
