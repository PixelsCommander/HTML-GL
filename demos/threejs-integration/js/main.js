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

/* var eye = new Eye(scene, three);
eye.x = 0;
eye.y = -10; */

three.on('update', function (timestamp) {
    controls.update();
    fpVrControls.update(Date.now());
});

//Adding UI to scene
var elementToAddToScene = document.getElementById('gl-header');
var htmlglNode = window.HTMLGL.createElement(elementToAddToScene, {
    material: new THREE.MeshPhongMaterial( {
        color: 'rgb(255,255,255)',
        shininess: 320,
        combine: THREE.MixOperation,
        envMap: this.reflectionCamera.renderTarget.texture,
        reflectivity: 0.2,
        specular: 0xffffff,
    } );
});
var htmlglThreeObject = htmlglNode.displayObject;

scene.add(htmlglThreeObject);