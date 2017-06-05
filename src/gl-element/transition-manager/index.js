var TWEEN = require('tween.js');
var utils = require('../../utils/index');

class GLTransitionManager {
    constructor(glElement) {
        this.glElement = glElement;
        this.node = glElement.node;

        this.transitions = {};
    }

    processChange(propertyName, oldValue, newValue) {

        if (propertyName === 'transform') {
            var transformObject = utils.getTransformObjectFromString(newValue);

            for (var propertyName in transformObject) {

                //TODO Move parsing to getTransformObjectFromString
                var newValue = parseFloat(transformObject[propertyName]);
                var oldValue = this.glElement.transformObject[propertyName];

                if (oldValue != newValue) {
                    this.startTween(propertyName, oldValue, newValue);
                }
            }

        } else {
            this.startTween(propertyName, oldValue, newValue);
        }
    }

    startTween(propertyName, oldValue, newValue) {

        if (this.transitions[propertyName]) {
            return;
        }

        var self = this;
        this.transitions[propertyName] = this.transitions[propertyName] || new TWEEN.Tween(this.glElement);

        var tweenConfig = {};
        tweenConfig[propertyName] = newValue;

        logger.info('Starting transition ', propertyName, oldValue, newValue);

        this.transitions[propertyName].to(tweenConfig, 200)
            //.easing(TWEEN.Easing.Elastic.InOut)
            .onUpdate(function (e, b) {
                logger.info('Tweening ', propertyName, ' progress ', e);
                self.glElement[propertyName] = e * newValue;
            })
            .onComplete(function () {
                self.transitions[propertyName] = null;
            })
            .start();
    }

    dispose() {
        this.glElement = null;
        this.node = null;
    }
}

animate();

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
}

module.exports = GLTransitionManager;