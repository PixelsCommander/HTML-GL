import * as THREE from 'three';
import IGLRenderer from '../IGLRenderer';
import {getCurrentContext} from '../../GLContext';
import ThreeGLRendererView from './ThreeGLRendererView';
import * as utils from '../../utils';
import * as ShaderToyMaterial from 'three-shadertoy-material';

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
        glElement.displayObject.name = glElement.node.tagName + '_' + (glElement.node.id || glElement.node.className);

        //Creating plane
        var geometry = new THREE.PlaneGeometry(0, 0);
        var material = createDefaultMaterial();

        glElement.sprite = new THREE.Mesh(geometry, material);
        glElement.sprite.glElement = glElement;
        glElement.displayObject.add(glElement.sprite);
        glElement.sprite.castShadow = false;

        this.sprites.push(glElement.sprite);

        return glElement.displayObject;
    }

    disposeDisplayObject(glElement) {
        if (glElement.displayObject) {

            const index = this.sprites.indexOf(glElement.sprite);
            if (index > -1) {
                this.sprites.splice(index, 1);
            }

            const object = glElement.displayObject;
            object.geometry?.dispose();
            object.material?.dispose();
            this.scene?.remove(object);
        }
    }

    // imageData is a HTMLCanvas instance or HTMLImage
    setTexture(glElement, imageData?) {
        let texture = glElement.sprite.material.map;

        if (imageData) {
            texture = new THREE.Texture(imageData);
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearMipMapNearestFilter;
            texture.anisotropy = 16;
        }

        glElement.sprite.geometry.dispose();
        glElement.sprite.material.dispose();

        var width = glElement.boundingRect.width;
        var height = glElement.boundingRect.height;
        var geometry = new THREE.PlaneGeometry(width, height);
        geometry.translate(width / 2, -height / 2, 0);

        glElement.sprite.geometry = geometry;
        glElement.sprite.material.map = texture;

        if (glElement.shader && !(glElement.sprite.material instanceof ShaderToyMaterial)) {
            glElement.sprite.material?.dispose();
            glElement.sprite.material = new ShaderToyMaterial(glElement.shader, {
                map: texture,
                width,
                height,
                transparentize: glElement.settings.transparentize,
            });
            glElement.sprite.material.map = texture;
            glElement.sprite.material.transparent = true;
        } else if (!glElement.shader && glElement.sprite.material instanceof ShaderToyMaterial) {
            glElement.sprite.material = createDefaultMaterial();
            glElement.sprite.material.map = texture;
        }
    }

    setTransform(glElement, transformObject) {
        const x = transformObject.translateX + glElement.boundingRect.left;
        const y = transformObject.translateY + glElement.boundingRect.top;

        var displayObject = glElement.displayObject;
        displayObject.position.set(x, -y, transformObject.translateZ);
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
        //this.createDisplayObject(glElement);
        //glElement.updateTexture();
        this.setTexture(glElement);
        console.log('SET SHADER');
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
            node = document.elementFromPoint(x - (glelement.transformObject.translateX || 0), y - (glelement.transformObject.translateY || 0))
            if (utils.isChildOf(node, glelement)) {
                result.push(node);
            }
        });

        return result;
    }

    intersectionsAtPoint(x, y) {
        var mouse = {
            x: (x / window.innerWidth) * 2 - 1,
            y: -(y / window.innerHeight) * 2 + 1
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

    redrawStage = () => {
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

function createDefaultMaterial() {
    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
    });
    material.transparent = true;
    material.depthTest = false;
    return material;
}
