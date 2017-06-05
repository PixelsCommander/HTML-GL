/*
 * GLObserver is a part of HTML GL library listening for DOM / styles changes and transitions on HTML element
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var _ = require('lodash');
var MutationObserver = require('./mutation-observer');
var StyleObserver = require('./style-observer');
var TransitionObserver = require('./transition-observer');
var helpers = require('./helpers');
var elementHelpers = require('../helpers');
var logger = require('js-logger');

class GLObserver {
    constructor(glElement) {
        this.glElement = glElement;
        this.node = glElement.node;

        this.mutationObserver = new MutationObserver(this.glElement, this.onDOMChanged.bind(this));
        this.styleObserver = new StyleObserver(this.glElement, this.onStyleChanged.bind(this));
        this.transitionObserver = new TransitionObserver(this.glElement, this.onTransitionStarted.bind(this));
    }

    onDOMChanged(mutations) {

        logger.info('DOM changed', mutations);

        //If there are style mutations
        if (mutations.filter(helpers.isStyleMutation).length) {

            //If style observer update on RAF disabled we update it from style mutation
            if (this.glElement.settings.styleObserverDisabled) {
                this.glElement.observer.styleObserver.update();
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
            if (elementHelpers.isGLNode(removedNodes[i])) {
                logger.info('Processing node removal ' + removedNodes[i]);

                //TODO Move to delayed queue executed after the loop to avoid duplication of updates

                //Reflow from the root
                var GLRootToReflow = elementHelpers.getGLRoot(this.glElement);
                GLRootToReflow.update('children');

                //Actual removal
                var nodeGLElement = elementHelpers.getGLElement(removedNodes[i]);
                this.glElement.removeChild(nodeGLElement);
            }
        }
    }

    onStyleChanged(diff, prevStyle, nextStyle) {
        logger.info('Style changed ');

        var diffPropertiesNames = Object.keys(diff);

        //If we are not in heavy diff mode then substract transiting properties and start transisitions
        if (!this.glElement.settings.heavyDiff && !this.glElement.settings.transitionsDisabled) {

            //processDiff returns list of properties with transiting ones filtered out
            //transitionObserver call callback (onTransitionStarted) for ones which should be transited
            diffPropertiesNames = this.transitionObserver.processDiff(diff, prevStyle, nextStyle);
        }

        this.updateProperties(diffPropertiesNames);
    }

    onTransitionStarted(propertyName, prevValue, nextValue, options) {
        logger.info('Transition started ', propertyName, prevValue, ' > ', nextValue, options);

        //Tween from A to B
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
        this.transitionObserver.dispose();
    }
}

module.exports = GLObserver;