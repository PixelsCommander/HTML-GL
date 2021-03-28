import { dispatchEvent } from './utils';
import { getCurrentContext } from './GLContext';

export class GLInteractionController {

    private oldNodes: Array<HTMLElement> = [];
    private trackingNode: HTMLElement;

    public static instance: GLInteractionController;

    constructor(trackingNode) {
        this.trackingNode = trackingNode;
        GLInteractionController.instance = this;

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

    processIntersectedNodes(nodes) {

        if ( nodes.length > 0 ) {

            //If it was not there but now is then mouseover
            nodes.forEach((node) => {
                    if (this.oldNodes.indexOf(node) == -1) {
                    dispatchEvent(node, {
                        type: 'mouseover'
                    });
                }
            });

            //If it was there but now is not then mouseleave
            this.oldNodes.forEach((node) => {
                    if (nodes.indexOf(node) == -1) {
                    dispatchEvent(node, {
                        type: 'mouseleave'
                    });
                }
            });
        } else {
            this.oldNodes.forEach((node) => {
                dispatchEvent(node, {
                    type: 'mouseleave'
                });
            });
        }

        this.oldNodes = nodes.slice(0);
    }

    onMouseEvent (event) {
        if (event.dispatcher === 'html-gl') return;

        var x = event.x || event.pageX,
            y = event.y || event.pageY,
            //Finding element under mouse position
            nodes = getCurrentContext().renderer.nodesAtPoint(x, y);

        //Emit action event if there is an element under mouse position
        if (nodes.length) {
            dispatchEvent(nodes[0], event);

            /* nodes.forEach((node) => {
                dispatchEvent(node, event);
            }); */
        }

        //Process mouse enter / leave
        this.processIntersectedNodes(nodes);
    }
}

export default GLInteractionController;