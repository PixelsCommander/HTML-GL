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
var sky = new Sky(scene, three);

//Adding UI to scene
window.elementToAddToScene = document.getElementById('gl-element');
var htmlglNode = window.HTMLGL.createElement(elementToAddToScene, {
    material: new THREE.MeshPhongMaterial({
        color: 'rgb(255,255,255)',
        shininess: 50,
        combine: THREE.MixOperation,
        reflectivity: 40.6,
        specular: 0xffffff,
    }),
    heavyDiff: true,
    oninitialized: function(){
        var bbox = new THREE.Box3().setFromObject(htmlglThreeObject);
        wrapper.position.set( - bbox.max.x / 2, - bbox.min.y / 2, -4);
        camera.lookAt(wrapper.position);
    }
});

//Since HTML-GL changes positions of displayObject on it`s own in accordance to HTML element coordinates
//we should set up a wrapper to be able to set position we would like
var wrapper = new THREE.Object3D();
scene.add(wrapper);

var htmlglThreeObject = htmlglNode.displayObject;
wrapper.add(htmlglThreeObject);

htmlglNode.renderer.registerScene(scene, camera);

// add spot light
var geometry	= new THREE.CylinderGeometry( 0.1, 0.5, 5, 32*2, 20, true);
// var geometry	= new THREE.CylinderGeometry( 0.1, 5*Math.cos(Math.PI/3)/1.5, 5, 32*2, 20, true);
geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -geometry.parameters.height/2, 0 ) );
geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
// geometry.computeVertexNormals()
// var geometry	= new THREE.BoxGeometry( 3, 1, 3 );
// var material	= new THREE.MeshNormalMaterial({
// 	side	: THREE.DoubleSide
// });
// var material	= new THREE.MeshPhongMaterial({
// 	color		: 0x000000,
// 	wireframe	: true,
// })
var material	= new THREEx.VolumetricSpotLightMaterial()
var mesh	= new THREE.Mesh( geometry, material );
mesh.position.set(1.5,2,0)
mesh.lookAt(new THREE.Vector3(0,0, 0))
material.uniforms.lightColor.value.set('white')
material.uniforms.spotPosition.value	= mesh.position
scene.add( mesh );

//////////////////////////////////////////////////////////////////////////////////
//		link it with a spotLight					//
//////////////////////////////////////////////////////////////////////////////////

var spotLight	= new THREE.SpotLight()
spotLight.position.copy(mesh.position)
spotLight.color		= mesh.material.uniforms.lightColor.value
spotLight.exponent	= 30;
spotLight.angle		= Math.PI/38;
spotLight.intensity	= 1;

spotLight.castShadow = true;
//spotLight.shadowCameraVisible = true;

spotLight.shadowMapWidth = spotLight.shadowMapHeight = 2048;

var d = 50;

spotLight.shadowBias = 0.0015;
spotLight.shadowCameraLeft = -d;
spotLight.shadowCameraRight = d;
spotLight.shadowCameraTop = d;
spotLight.shadowCameraBottom = -d;
spotLight.shadowCameraNear = 1;
spotLight.shadowCameraFar = 500;
spotLight.shadowDarkness = 0.5;

scene.add( spotLight );
scene.add( spotLight.target );

three.renderer.shadowMapEnabled	= true;
three.renderer.shadowMapSoft = true;
three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
three.renderer.shadowMap.cullFace = THREE.CullFaceBack;

var intersection = null;

three.on('update', function (timestamp) {
    controls.update();
    fpVrControls.update(Date.now());

    if (!intersection){
        var angle	= 0.1 * Math.PI*2*(Date.now() / 1000);
        var target	= new THREE.Vector3(1*Math.cos(angle),0,1*Math.sin(angle));
        mesh.lookAt(target);
        spotLight.target.position.copy(target);
    }
});

window.addEventListener('mousemove', function(e){
    var intersections = window.HTMLGL.renderer.intersectionsAtPoint(e.clientX, e.clientY);

    if (intersections.length) {
        var target = intersection = intersections[0].point;
        mesh.lookAt(target);
        spotLight.target.position.copy(target);
    } else {
        intersection = null;
    }
});