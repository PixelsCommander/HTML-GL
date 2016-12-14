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

class GLObserver {
    constructor(glElement) {
        this.glElement = glElement;
        this.node = glElement.node;

        this.mutationObserver = new MutationObserver(this.glElement, this.onDOMChanged.bind(this));
        this.styleObserver = new StyleObserver(this.glElement, this.onStyleChanged.bind(this));
        this.transitionObserver = new TransitionObserver(this.glElement, this.onTransitionStarted.bind(this));
    }

    onDOMChanged(mutations) {

        console.log('DOM changed', mutations);

        //If there are style mutations
        if (mutations.filter(helpers.isStyleMutation).length) {

            //If style observer update on RAF disabled we update it from style mutation
            if (this.glElement.settings.styleObserverDisabled) {
                this.glElement.observer.styleObserver.update();
            }

            return;
        }

        //Rerender
        this.glElement.updateTexture();

        if (mutations[0].addedNodes.length) {
            this.glElement.update('children');
        }

        //TODO Handle node removal
    }

    onStyleChanged(diff, prevStyle, nextStyle) {
        console.log('Style changed ');

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
        console.log('Transition started ', propertyName, prevValue, ' > ', nextValue, options);

        //Tween from A to B
    }

    updateProperties(properties) {
        for (var i = 0; i < properties.length; i++) {
            var propertyName = properties[i];
            this.glElement.update(propertyName);
        }
    }
}

module.exports = GLObserver;