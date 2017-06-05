var MIN_VOLUME_TO_REACT = 0.5;
var MIN_VOLUME_TO_FALL_DAWN = 1.0;
var MIN_EQ_TWEEN_TIME = 100;
var TIME_ON_PEAK = 0;
var FALL_DAWN_TIME = 100;

var three = THREE.Bootstrap();
var scene = three.scene;
var camera = three.camera;
var controls = new THREE.VRControls(three.camera);
var fpVrControls = new THREE.FirstPersonVRControls(camera, scene);
fpVrControls.movementSpeed = 10;

var landscape = new Landscape(scene);
var skyeq = new SkyEQ(scene, three);

three.on('update', function (timestamp) {
    controls.update();
    fpVrControls.update(Date.now());
});

//Adding UI to scene
window.elementToAddToScene = document.getElementById('gl-element');
var htmlglNode = window.HTMLGL.createElement(elementToAddToScene, {
    material: new THREE.MeshPhongMaterial({
        //color: 'rgb(255,255,255)',
        //shininess: 50,
        //combine: THREE.MixOperation,
        //reflectivity: 40.6,
        //specular: 0xffffff,
    }),
    heavyDiff: true
});

//Since HTML-GL changes positions of displayObject on it`s own in accordance to HTML element coordinates
//we should set up a wrapper to be able to set position we would like
var wrapper = new THREE.Object3D();
scene.add(wrapper);
wrapper.position.set(-1, 0.5, -2);

var htmlglThreeObject = htmlglNode.displayObject;
wrapper.add(htmlglThreeObject);

htmlglNode.renderer.registerScene(scene, camera);