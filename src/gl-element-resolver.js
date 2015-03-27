/*
 * GLElementResolver is a part of HTML GL library for resolving elements by coordinates given
 * Copyright (c) 2015 pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 * */

(function (w) {
    var GLElementResolver = function (context) {
    }

    var p = GLElementResolver.prototype;

    p.getElementByCoordinates = function (x, y) {
        var element,
            self = this,
            result;

        w.HTMLGL.elements.forEach(function (glelement) {
            element = document.elementFromPoint(x - parseInt(glelement.transformObject.translateX || 0), y - parseInt(glelement.transformObject.translateY || 0))
            if (self.isChildOf(element, glelement)) {
                result = element;
            }
        });

        return result;
    }

    p.isChildOf = function (child, parent) {
        var current = child;
        while (current) {
            if (current === parent) return true;
            current = current.parentNode;
        }
        return false;
    }

    w.HTMLGL.GLElementResolver = GLElementResolver;
})(window);