var constants = require('../constants');
var utils = require('../utils');
var InteractionController = require('../interaction-controller');

var scene = null;
var camera = null;
var raycaster = null;
var sprites = [];

var VRClickEnabled = false;

var ThreeRenderer = {
    createDisplayObject: function (glElement) {

        //Creating container
        glElement.displayObject = new THREE.Object3D();
        glElement.container = new THREE.Object3D();

        glElement.displayObject.name = glElement.node.tagName + '_' + (glElement.node.id || glElement.node.className);

        //Creating plane
        var geometry = new THREE.PlaneGeometry(glElement.boundingRect.width, glElement.boundingRect.height);
        var material = glElement.settings.material.clone() || new THREE.MeshLambertMaterial();

        material.transparent = true;
        material.depthTest = false;

        glElement.sprite = new THREE.Mesh(geometry, material);

        //We need a reference from ThreeJS to glElement
        glElement.sprite.glElement = glElement;

        glElement.displayObject.add(glElement.container);
        glElement.container.add(glElement.sprite);

        sprites.push(glElement.sprite);

        //glElement.displayObject.castShadow = true;
        //glElement.container.castShadow = true;
        glElement.sprite.castShadow = true;

        return glElement.displayObject;
    },

    // imageData is a HTMLCanvas instance or HTMLImage
    setTexture: function (glElement, imageData) {

        glElement.sprite.geometry.dispose();
        glElement.sprite.material.dispose();

        var width = glElement.scale * glElement.boundingRect.width;
        var height = glElement.scale * glElement.boundingRect.height;

        var geometry = new THREE.PlaneGeometry(width, height);
        geometry.translate(width / 2, -height / 2, 0);
        glElement.sprite.geometry = geometry;

        var texture = new THREE.Texture(imageData);
        texture.needsUpdate = true;
        //texture.minFilter = THREE.NearestMipMapNearestFilter;
        texture.minFilter = THREE.LinearMipMapNearestFilter;
        //texture.minFilter = THREE.NearestMipMapLinearFilter;
        //texture.minFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestFilter;
        //texture.minFilter = THREE.NearestMipMapNearestFilter;

        texture.anisotropy = 16;

        glElement.sprite.material.map = texture;
    },

    /*
     * transformObject = {
     *   translateX
     *   translateY
     *   translateZ
     *   scaleX
     *   scaleY
     *   scaleZ
     *   rotateX
     *   rotateY
     *   rotateZ
     * }
     *
     * */
    setTransform: function (glElement, transformObject) {

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

        displayObject.position.set((transformObject.translateX + offsetX - addx) * scale, (-transformObject.translateY - offsetY + addy) * scale, transformObject.translateZ );
        displayObject.scale.set(transformObject.scaleX, transformObject.scaleY, transformObject.scaleZ);
    },

    setOpacity: function (glElement, opacityValue) {

        glElement.displayObject.traverse(function (node) {
            if (node.material) {
                node.material.opacity = opacityValue;
                node.material.transparent = true;
            }
        });
    },

    addTo: function (parentGLElement, glElement) {

        parentGLElement.displayObject.add(glElement.displayObject);
    },

    removeFrom: function (parentGLElement, glElement) {
        parentGLElement.displayObject.remove(glElement.displayObject);
        sprites.splice(sprites.indexOf(glElement.sprite), 1);
    },

    objectsAtPoint (x, y) {

        var intersects = ThreeRenderer.intersectionsAtPoint(x, y).map((intersect) => {
            return intersect.object;
        });

        return intersects;
    },

    intersectionsAtPoint (x, y) {

        var mouse = {
            x: ( x / window.innerWidth ) * 2 - 1,
            y: - ( event.clientY / window.innerHeight ) * 2 + 1
        }

        raycaster.setFromCamera( mouse, camera );
        return raycaster.intersectObjects( sprites );
    },

    registerScene: function (sceneArg, cameraArg) {

        scene = sceneArg;
        camera = cameraArg;

        raycaster = raycaster || new THREE.Raycaster();
    },

    detectVRMouseEvents () {

        if (camera && scene) {

            raycaster.set( camera.getWorldPosition(), camera.getWorldDirection() );

            var intersects = raycaster.intersectObjects( sprites ).map((intersect) => {
                return intersect.object;
            });

            InteractionController.instance.processIntersections(intersects);
        }

        if (VRClickEnabled) {
            requestAnimationFrame(ThreeRenderer.detectVRMouseEvents);
        }
    },

    enableVRClick () {
        VRClickEnabled = true;
        requestAnimationFrame(ThreeRenderer.detectVRMouseEvents);
    },

    disableVRClick () {
        VRClickEnabled = false;
    }
};

module.exports = ThreeRenderer;