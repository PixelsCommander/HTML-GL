/*
 * GLEffectsManager is a part of HTML GL library for applying effects based on tag attributes
 * Copyright (c) 2015 pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 * */

(function (w) {
    var GLEffectsManager = function (element) {
        this.element = element;
        this.filters = {};
        this.initObserver();
        this.updateFilters();
    }

    var p = GLEffectsManager.prototype;

    p.initObserver = function () {
        var self = this,
            config = {
                attributes: true,
                attributeFilter: ['effects']
            };

        this.observer = this.observer || new MutationObserver(self.updateFilters.bind(this));

        this.observer.observe(this.element, config);
    }

    p.updateFilters = function () {
        var attributeValue = this.element.getAttribute('effects') || '',
            effectsNamesArray = attributeValue.split(' ');

        this.addFiltersFromAttributes(effectsNamesArray);
        this.cleanFiltersFromAttributes(effectsNamesArray);
    }

    p.addFiltersFromAttributes = function (effectsNamesArray) {
        var self = this;
        effectsNamesArray.forEach(function (effectName) {
            if (HTMLGL.effects[effectName]) {
                self.filters[effectName] = self.filters[effectName] || new HTMLGL.effects[effectName](self.element);
            }
        });
    }

    p.cleanFiltersFromAttributes = function (effectsNamesArray) {
        var self = this;
        Object.keys(this.filters).forEach(function (effectName) {
            if (effectsNamesArray.indexOf(effectName) === -1 && self.filters[effectName]) {
                self.filters[effectName].destroy();
                self.filters[effectName] = null;
            }
        });
    }

    w.HTMLGL.GLEffectsManager = GLEffectsManager;

    //Reinitialize effects on elements
    w.HTMLGL.elements.forEach(function (element) {
        element.initEffects();
    });
})(window);