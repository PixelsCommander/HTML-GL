var utils = require('./utils');

class InteractionController {
    constructor(trackingNode) {

        this.trackingNode = trackingNode;
        this.oldIntersections = [];

        InteractionController.instance = this;

        this.initListeners();
    }

    initListeners() {
        //document listeners - mouse and touch events
        this.trackingNode.addEventListener('click', this.onMouseEvent.bind(this), true);
        this.trackingNode.addEventListener('mousemove', this.onMouseEvent.bind(this), true);
        this.trackingNode.addEventListener('mouseup', this.onMouseEvent.bind(this), true);
        this.trackingNode.addEventListener('mousedown', this.onMouseEvent.bind(this), true);
        this.trackingNode.addEventListener('touchstart', this.onMouseEvent.bind(this));
        this.trackingNode.addEventListener('touchmove', this.onMouseEvent.bind(this));
        this.trackingNode.addEventListener('touchend', this.onMouseEvent.bind(this));
    }

    processIntersections(intersections) {

        if ( intersections.length > 0 ) {

            //If it was not there but now is then mouseover
            intersections.forEach((intersect) => {
                    if (this.oldIntersections.indexOf(intersect) == -1) {
                    utils.dispatchEvent(intersect.glElement.node, {
                        type: 'mouseover'
                    });
                }
            });

            //If it was there but now is not then mouseleave
            this.oldIntersections.forEach((intersect) => {
                    if (intersections.indexOf(intersect) == -1) {
                    utils.dispatchEvent(intersect.glElement.node, {
                        type: 'mouseleave'
                    });
                }
            });
        } else {
            this.oldIntersections.forEach((intersect) => {
                utils.dispatchEvent(intersect.glElement.node, {
                    type: 'mouseleave'
                });
            });
        }

        this.oldIntersections = intersections.slice(0);
    }

    onMouseEvent (event) {
        var x = event.x || event.pageX,
            y = event.y || event.pageY,
            //Finding element under mouse position
            elements = window.HTMLGL.renderer.objectsAtPoint(x, y);

        //Emit action event if there is an element under mouse position
        if (elements.length && event.target.tagName === 'CANVAS') {
            elements.forEach((element) => {
                utils.dispatchEvent(element.glElement.node, event);
            });
        }

        //Process mouse enter / leave
        this.processIntersections(elements);
    }
}

module.exports = InteractionController;