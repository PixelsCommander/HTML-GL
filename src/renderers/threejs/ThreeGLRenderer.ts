import * as THREE from 'three';
import IGLRenderer from '../IGLRenderer';
import { getCurrentContext } from '../../GLContext';
import ThreeGLRendererView from './ThreeGLRendererView';
import * as constants from '../../constants';
import * as utils from '../../utils';
import GLInteractionController from '../../GLInteractionController';

export class ThreeGLRenderer implements IGLRenderer {
    public sprites = [];
    public view = new ThreeGLRendererView(this);
    public scene;
    public camera;
    private raycaster = new THREE.Raycaster();

    constructor() {
        this.redrawLoop();
    }

    createDisplayObject(glElement) {

        //Creating container
        glElement.displayObject = new THREE.Object3D();
        glElement.container = new THREE.Object3D();

        glElement.displayObject.name = glElement.node.tagName + '_' + (glElement.node.id || glElement.node.className);

        //Creating plane
        var geometry = new THREE.PlaneGeometry(glElement.boundingRect.width, glElement.boundingRect.height);
        /* var material = (glElement.settings.material && glElement.settings.material.clone()) || new THREE.MeshPhongMaterial({
                color: 0x555555,
                specular: 0x111111,
                shininess: 50
        }); */

        var material = new THREE.MeshBasicMaterial();

        material.transparent = true;
        material.depthTest = false;

        glElement.sprite = new THREE.Mesh(geometry, material);

        //We need a reference from ThreeJS to glElement
        glElement.sprite.glElement = glElement;

        glElement.displayObject.add(glElement.container);
        glElement.container.add(glElement.sprite);

        this.sprites.push(glElement.sprite);

        glElement.sprite.castShadow = true;

        return glElement.displayObject;
    }

    // imageData is a HTMLCanvas instance or HTMLImage
    setTexture(glElement, imageData) {

        glElement.sprite.geometry.dispose();
        glElement.sprite.material.dispose();

        var width = glElement.scale * glElement.boundingRect.width;
        var height = glElement.scale * glElement.boundingRect.height;

        var geometry = new THREE.PlaneGeometry(width, height);
        geometry.translate(width / 2, -height / 2, 0);
        glElement.sprite.geometry = geometry;

        var texture = new THREE.Texture(imageData);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearMipMapNearestFilter;

        texture.anisotropy = 16;

        glElement.sprite.material.map = texture;
    }

    setTransform(glElement, transformObject) {
        //Speed up and rethink this mess
        var displayObject = glElement.displayObject;
        var scale = glElement.scale;

        var sprite = glElement.sprite;
        var container = glElement.container;
        var offsetX = glElement.boundingRect.width / 2;
        var offsetY = glElement.boundingRect.height / 2;
        container.position.set(-offsetX * scale, offsetY * scale, 0);

        var addx = glElement.parent ? glElement.parent.boundingRect.width / 2 : 0;
        var addy = glElement.parent ? glElement.parent.boundingRect.height / 2 : 0;

        displayObject.position.set((transformObject.translateX + offsetX - addx) * scale, (-transformObject.translateY - offsetY + addy) * scale, transformObject.translateZ);
        displayObject.scale.set(transformObject.scaleX, transformObject.scaleY, transformObject.scaleZ);
    }

    setOpacity(glElement, opacityValue) {
        glElement.displayObject.traverse(function (node) {
            if (node.material) {
                node.material.opacity = opacityValue;
                node.material.transparent = true;
            }
        });
    }

    setShader(glElement, shaderCode) {
        // TODO
    }

    updateUniform(glElement, uniformName, uniformValue) {
        // TODO
    }

    addTo(parentGLElement, glElement) {
        if (parentGLElement) {
            parentGLElement.displayObject.add(glElement.displayObject);
        } else {
            getCurrentContext().document.add(glElement.displayObject);
        }
    }

    removeFrom(parentGLElement, glElement) {
        parentGLElement.displayObject.remove(glElement.displayObject);
        parentGLElement.sprites.splice(parentGLElement.sprites.indexOf(glElement.sprite), 1);
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

        /*

        This is implementation of nodes when hovering 3d transformed scene will be useful for free 3d mode

        var intersects = ThreeRenderer.intersectionsAtPoint(x, y).map((intersect) => {
            return intersect.object;
        });

        return intersects; */
    }

    intersectionsAtPoint(x, y) {

        var mouse = {
            x: ( x / window.innerWidth ) * 2 - 1,
            y: -( y / window.innerHeight ) * 2 + 1
        }

        this.raycaster.setFromCamera(mouse, this.view.camera);
        return this.raycaster.intersectObjects(this.sprites);
    }

    registerScene(sceneArg, cameraArg) {
        getCurrentContext().scene = sceneArg;
        this.scene = sceneArg;
        this.camera = cameraArg;
    }

    redrawLoop = () => {
        if (this.scene && this.camera && getCurrentContext().scene && this.view.engineRenderer) {
            this.view.engineRenderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.redrawLoop);
    }

    redrawStage() {
        if (this.view.engineRenderer && getCurrentContext().enabled) {
            this.view.engineRenderer.render(this.scene, this.camera);
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

export default ThreeGLRenderer;