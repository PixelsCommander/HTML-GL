import * as helpers from './helpers';
import { getCurrentContext } from '../GLContext';
import { diff } from 'deep-object-diff';
import GLElement from "./GLElement";

module.exports = {
    transform: function() {
        //Retreiving transformations data from styles object, usually filled by StyleObserver
        this.transformObject = helpers.getTransformObject(this);

        //Fixing defaults
        this.transformObject.translateX = parseFloat(this.transformObject.translateX) || 0;
        this.transformObject.translateY = parseFloat(this.transformObject.translateY) || 0;
        this.transformObject.translateZ = parseFloat(this.transformObject.translateZ) || 0;
        this.transformObject.scaleX = parseFloat(this.transformObject.scaleX) || 1;
        this.transformObject.scaleY = parseFloat(this.transformObject.scaleY) || 1;
        this.transformObject.scaleZ = parseFloat(this.transformObject.scaleZ) || 1;
        this.transformObject.rotateX = (parseFloat(this.transformObject.rotateX) / 180) * Math.PI || 0;
        this.transformObject.rotateY = (parseFloat(this.transformObject.rotateY) / 180) * Math.PI || 0;
        this.transformObject.rotateZ = (parseFloat(this.transformObject.rotateZ) / 180) * Math.PI || 0;

        this.markAsChanged();
    },
    opacity: function(styleObject) {
        var style = styleObject || this.styleObject;
        this.opacity = parseFloat(style.opacity) || 1;

        this.markAsChanged();
    },
    boundingRect: function() {
        var boundingRect = this.node.getBoundingClientRect();
        var oldBoundingRect = this.boundingRect;

        this.boundingRect = {
            left: boundingRect.left,
            right: boundingRect.right,
            top: boundingRect.top,
            bottom: boundingRect.bottom,
            width: boundingRect.width,
            height: boundingRect.height,
        };

        if (this.parent && this.parent.boundingRect) {
            this.boundingRect.left -= this.parent.boundingRect.left;
            this.boundingRect.top -= this.parent.boundingRect.top;
        }

        if (Object.keys(this.transformObject).length) {
            this.boundingRect.left = getCurrentContext().scrollX + parseFloat(this.boundingRect.left) - this.transformObject.translateX;
            this.boundingRect.top = getCurrentContext().scrollY + parseFloat(this.boundingRect.top) - this.transformObject.translateY;
        }

        //If size changed then update texture
        if (JSON.stringify(oldBoundingRect) !== JSON.stringify(this.boundingRect)) {
            this.updateTexture();
        }

        //console.log('Updated bounding rect ', diff);
    },
    children: function() {
        GLElement.processChildren(this.node, this.node);
    },
    updateStyles: function() {
        this.update('transform');
        this.update('opacity');
    }
};
