/*
 * GLEffectsManager is a part of HTML GL library for applying effects based on tag attributes
 * Copyright (c) 2015 pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 * */

(function (w) {
    var GLEffectsManager = function (element) {
        this.element = element;
        this.filters = [];
        this.updateFiltersFromAttribute();
    }

    var p = GLEffectsManager.prototype;

    p.updateFiltersFromAttribute = function () {
        var attributeValue = this.element.getAttribute('effects') || '',
            effects = attributeValue.split(' '),
            self = this;

        effects.forEach(function(effectName){
            if (HTMLGL.effects[effectName]) {
                new HTMLGL.effects[effectName](self.element);
            };
        });
    }

    p.cleanFiltersFromAttribute = function () {

    }

    w.HTMLGL.GLEffectsManager = GLEffectsManager;

    //Reinitialize effects on elements
    w.HTMLGL.elements.forEach(function(element){
        element.initEffects();
    });
})(window);