/*
 * This is a part of HTML GL library
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 */

var utils = {
    getTransitionEventName: function () {
        return 'transitionstart';
    },
    getNodeTransformObject: function (node) {
        var styleObject = window.getComputedStyle(node);
        return utils.getTransformObjectFromString(styleObject.transform);
    },
    getTransformObjectFromPropertiesString: function (transformString) {
        return (transformString.match(/([\w]+)\(([^\)]+)\)/g) || [])
            .map(function (it) {
                return it.replace(/\)$/, "").split(/\(/)
            })
            .reduce(function (m, it) {
                return m[it[0]] = it[1], m
            }, {});
    },
    getTransformObjectFromString: function (transformString) {
        var matrix = utils.parseMatrix(transformString),
            rotateY = Math.asin(-matrix.m13),
            rotateX,
            rotateZ;

        rotateX = Math.atan2(matrix.m23, matrix.m33);
        rotateZ = Math.atan2(matrix.m12, matrix.m11);

        return {
            rotateX,
            rotateY,
            rotateZ,
            translateX: matrix.m41,
            translateY: matrix.m42,
            translateZ: matrix.m43,
            scaleX: matrix.m11,
            scaleY: matrix.m22,
            scaleZ: matrix.m33
        };

    },
    parseMatrix: function (matrixString) {
        var c = matrixString.split(/\s*[(),]\s*/).slice(1, -1),
            matrix;

        if (c.length === 6) {
            // 'matrix()' (3x2)
            matrix = {
                m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
                m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
                m13: 0, m23: 0, m33: 1, m43: 0,
                m14: 0, m24: 0, m34: 0, m44: 1
            };
        } else if (c.length === 16) {
            // matrix3d() (4x4)
            matrix = {
                m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
                m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
                m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
                m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
            };

        } else {
            // handle 'none' or invalid values.
            matrix = {
                m11: 1, m21: 0, m31: 0, m41: 0,
                m12: 0, m22: 1, m32: 0, m42: 0,
                m13: 0, m23: 0, m33: 1, m43: 0,
                m14: 0, m24: 0, m34: 0, m44: 1
            };
        }
        return matrix;
    },
    dispatchEvent: function (element, event) {
        var newEvent = new MouseEvent(event.type, event);
        newEvent.dispatcher = 'html-gl';
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        element.dispatchEvent(newEvent);
    },
    isHTMLNode: function (node) {
        return node.tagName;
    },
    throttle: function (fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;

            var now = +new Date,
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);
            } else {
                last = now;
                fn.apply(context, args);
            }
        };
    }
};


module.exports = utils;