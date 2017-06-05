var three = THREE.Bootstrap();
var scene = three.scene;
var camera = three.camera;

var controls = new THREE.VRControls(three.camera);
var fpVrControls = new THREE.FirstPersonVRControls(camera, scene);
fpVrControls.movementSpeed = 10;

var light = new THREE.AmbientLight( 0xffffff, 1. ); // soft white light
scene.add( light );

//Selecting element to apply HTMLGL to
var elementToAddToScene = document.getElementById('htmlgl-container');

//Adding UI to scene
var htmlglNode = window.HTMLGL.createElement(elementToAddToScene, {

    material: new THREE.MeshPhongMaterial({
        color: 'rgb(255,255,255)',
        shininess: 50,
        combine: THREE.MixOperation,
        reflectivity: 40.6,
        specular: 0xffffff,
    }),

    oninitialized: centerContent,
    heavyDiff: true
});

//Since HTML-GL changes positions of displayObject on it`s own in accordance to HTML element coordinates
//we should set up a wrapper to be able to set position we would like
var wrapper = new THREE.Object3D();
scene.add(wrapper);

var htmlglThreeObject = htmlglNode.displayObject;
wrapper.add(htmlglThreeObject);

htmlglNode.renderer.registerScene(scene, camera);

//Update controls on tick
three.on('update', function (timestamp) {
    controls.update();
    fpVrControls.update(Date.now());
});

function centerContent(){
    var bbox = new THREE.Box3().setFromObject(htmlglThreeObject);
    wrapper.position.set( - bbox.max.x / 2, - bbox.min.y / 2, -2);
    camera.lookAt(wrapper.position);
}