/*
 * GLTransitionObserver is a part of HTML GL library listening for CSS transitions on HTML element
 * and reflecting this animatinos on GLElement
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var _ = require('lodash');
var diff = require('object-diff');
var utils = require('../../utils/index');
var transitionStartEventName = utils.getTransitionEventName();
var TransitionManger = require('../transition-manager');

class GLTransitionObserver {
    constructor(glElement, callback) {
        this.oldStyle = {};
        this.glElement = glElement;
        this.node = glElement.node;
        this.callback = callback;

        this.transitionManager = new TransitionManger(glElement);

        this.computedTransition = this.getTransitionByComputingStyle();
    }

    processDiff(diff, prevStyle, nextStyle) {

        var transitingPropertiesNames = [];
        var notTransitingProperties = [];

        var propsShouldTransite = this.getTransitionProps();
        var diffPropertiesNames = Object.keys(diff);

        //If transite all then do it
        if (propsShouldTransite[0] === 'all') {
            transitingPropertiesNames = diffPropertiesNames;
        } else {
            //Otherwise substract transiting properties from list
            transitingPropertiesNames = _.intersection(diffPropertiesNames, propsShouldTransite);
            notTransitingProperties = _.difference(diffPropertiesNames, propsShouldTransite);
        }

        for (var i = 0; i < transitingPropertiesNames.length; i++) {
            var options = this.getTransitionOptions();
            var propertyName = transitingPropertiesNames[i];
            this.callback(propertyName, prevStyle[propertyName], nextStyle[propertyName], options);
            this.transitionManager.processChange(propertyName, prevStyle[propertyName], nextStyle[propertyName]);
        }

        return notTransitingProperties;
    }

    getTransitionProps() {

        var transitionPropertyValue = this.getTransitionValue();

        if (transitionPropertyValue != 'none') {
            //Get list of proerties to transite
            return transitionPropertyValue.split(' ')[0].split(',');
        }
    }

    getTransitionOptions() {
        var transitionPropertyValue = this.getTransitionValue();
        var time = transitionPropertyValue.split(' ')[1];
        var easing = transitionPropertyValue.split(' ')[2];

        return {
            time,
            easing
        };
    }

    getTransitionValue() {
        return this.glElement.styleObject.transition != '' ? this.glElement.styleObject.transition : this.computedTransition;
    }

    getTransitionByComputingStyle() {
        return window.getComputedStyle(this.node).transition;
    }

    dispose() {
        this.glElement = null;
        this.node = null;
        this.callback = null;
        this.transitionManager.dispose();
        this.transitionManager = null;
    }
}

module.exports = GLTransitionObserver;