/*
 * Util is a part of HTML GL library
 * Copyright (c) 2015 pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 * */

(function(w){
    w.HTMLGL = w.HTMLGL || {};
    w.HTMLGL.util = {
        getterSetter: function  (variableParent, variableName, getterFunction, setterFunction) {
            if (Object.defineProperty) {
                Object.defineProperty(variableParent, variableName, {
                    get: getterFunction,
                    set: setterFunction
                });
            }
            else if (document.__defineGetter__) {
                variableParent.__defineGetter__(variableName, getterFunction);
                variableParent.__defineSetter__(variableName, setterFunction);
            }

            variableParent["get" + variableName] = getterFunction;
            variableParent["set" + variableName] = setterFunction;
        },
        emitEvent: function (element, event) {
            var newEvent = new MouseEvent(event.type, event);
            newEvent.dispatcher = 'html-gl';
            event.stopPropagation();
            element.dispatchEvent(newEvent);
        },
        debounce: function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }
    }
})(window);