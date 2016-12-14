var three = THREE.Bootstrap();
var scene = three.scene;
var camera = three.camera;
var controls = new THREE.VRControls(three.camera);
var fpVrControls = new THREE.FirstPersonVRControls(camera, scene);
fpVrControls.movementSpeed = 10;

var landscape = new Landscape(scene);

three.on('update', function (timestamp) {
    controls.update();
    fpVrControls.update(Date.now());
});

//Adding UI to scene
var elementToAddToScene = document.getElementById('content');
var htmlglNode = window.HTMLGL.createElement(elementToAddToScene, {
    material: new THREE.MeshPhongMaterial({
        color: 'rgb(255,255,255)',
        shininess: 50,
        combine: THREE.MixOperation,
        reflectivity: 40.6,
        specular: 0xffffff,
    }),
    heavyDiff: true
});

//Since HTML-GL changes positions of displayObject on it`s own in accordance to HTML element coordinates
//we should set up a wrapper to be able to set position we would like
var wrapper = new THREE.Object3D();
scene.add(wrapper);
wrapper.position.set(-1, 1, -2);

var htmlglThreeObject = htmlglNode.displayObject;
wrapper.add(htmlglThreeObject);

htmlglNode.renderer.registerScene(scene, camera);