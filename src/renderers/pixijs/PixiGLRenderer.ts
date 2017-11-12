import * as PIXI from 'pixi.js';
import IGLRenderer from '../IGLRenderer';
import { getCurrentContext } from '../../GLContext';
import PixiGLRendererView from './PixiGLRendererView';
import * as constants from '../../constants';
import * as utils from '../../utils';
import GLInteractionController from '../../GLInteractionController';

export class PixiGLRenderer implements IGLRenderer {
    public sprites = [];
    public view = new PixiGLRendererView(this);
    public scene = null;
    public camera = null;

    constructor() {
        this.redrawLoop();
    }

    createDisplayObject(glElement) {

        //Creating container
        glElement.sprite = new PIXI.Sprite();
        glElement.sprite.name = glElement.node.tagName + '_' + (glElement.node.id || glElement.node.className);

        //Creating sprite and container
        glElement.sprite.width = glElement.boundingRect.width;
        glElement.sprite.height = glElement.boundingRect.height;

        //We need a reference from ThreeJS to glElement
        glElement.sprite.glElement = glElement;

        this.sprites.push(glElement.sprite);

        return glElement.sprite;
    }

    // imageData is a HTMLCanvas instance or HTMLImage
    setTexture(glElement, imageData) {
        glElement.sprite.texture = PIXI.Texture.fromCanvas(imageData);
    }

    setTransform(glElement, transformObject) {

        //Speed up and rethink this mess
        var sprite = glElement.sprite;

        //var addx = glElement.parent ? glElement.parent.boundingRect.width / 2 : 0;
        //var addy = glElement.parent ? glElement.parent.boundingRect.height / 2 : 0;

        //displayObject.position.set((transformObject.translateX + offsetX - addx) * scale, (-transformObject.translateY - offsetY + addy) * scale, transformObject.translateZ);
        //displayObject.scale.set(transformObject.scaleX, transformObject.scaleY, transformObject.scaleZ);

        sprite.x = transformObject.translateX * getCurrentContext().getPixelRatio();
        sprite.y = transformObject.translateY * getCurrentContext().getPixelRatio();

        sprite.scale.x = 1;
        sprite.scale.y = 1;
    }

    setOpacity(glElement, opacityValue) {
        glElement.alpha = opacityValue;
    }

    setShader(glElement, shaderCode) {
        const filter = new PIXI.Filter(null, shaderCode, {
            uTime: {
                type: 'f',
                value: 0
            }
        });
        glElement.sprite.filters = [filter];
    }

    updateUniform(glElement, uniformName, uniformValue) {
        glElement.sprite.filters[0].uniforms[uniformName] = uniformValue;
    }

    addTo(parentGLElement, glElement) {
        if (parentGLElement) {
            parentGLElement.displayObject.addChild(glElement.displayObject);
        } else {
            getCurrentContext().document.addChild(glElement.sprite);
        }
    }

    removeFrom(parentGLElement, glElement) {
        parentGLElement.displayObject.removeChild(glElement.displayObject);
        this.sprites.splice(this.sprites.indexOf(glElement.sprite), 1);
    }

    nodesAtPoint(x, y) {
        var node,
            result = [];

        getCurrentContext().elements.forEach(function (glelement) {
            node = document.elementFromPoint(x - parseInt(glelement.transformObject.translateX || 0), y - parseInt(glelement.transformObject.translateY || 0))
            if (utils.isChildOf(node, glelement)) {
                result.push(node);
            }
        });

        return result;
    }

    intersectionsAtPoint(x, y) {
    }

    registerScene(sceneArg, cameraArg) {
        getCurrentContext().scene = sceneArg;
        this.scene = sceneArg;
    }

    redrawLoop = () => {
        getCurrentContext().scene && this.view.engineRenderer && this.view.engineRenderer.render(getCurrentContext().scene);
        requestAnimationFrame(this.redrawLoop);
    }

    redrawStage() {
        if (this.view.engineRenderer && getCurrentContext().enabled) {
            this.view.engineRenderer.render(getCurrentContext().scene);
            getCurrentContext().isChanged = false;
        }
    }

    //We would like to rerender if something changed, otherwise stand by
    markStageAsChanged() {
        if (this.view.engineRenderer && !getCurrentContext().isChanged) {
            requestAnimationFrame(this.redrawStage);
            getCurrentContext().isChanged = true;
        }
    }
}

export default PixiGLRenderer;