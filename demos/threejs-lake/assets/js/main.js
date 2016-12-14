function mainLoop() {
	requestAnimationFrame(mainLoop);
	DEMO.update();
}

/*function onDocumentMouseDown(event) {
    event.preventDefault();
    
    var mouse = new THREE.Vector2(
        ( event.clientX / window.innerWidth ) * 2 - 1, 
        - ( event.clientY / window.innerHeight ) * 2 + 1 );

    DEMO.ms_Raycaster.setFromCamera( mouse, DEMO.ms_Camera );
    var intersects = DEMO.ms_Raycaster.intersectObjects( DEMO.ms_Clickable );    

    if (intersects.length > 0) {  
        intersects[0].object.callback();
    }                
}*/

$(function() {
	WINDOW.initialize();

	//document.addEventListener('click', onDocumentMouseDown, false);
	
	var parameters = {
		alea: RAND_MT,
		generator: PN_GENERATOR,
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1,
		filter: [ CIRCLE_FILTER ],
		postgen: [ MOUNTAINS_COLORS ],
		effect: [ DESTRUCTURE_EFFECT ]
	};
	
	DEMO.initialize('canvas-3d', parameters);

	//Adding UI to scene
	var elementToAddToScene = document.getElementById('gl-iframe');
	var htmlglNode = window.HTMLGL.createElement(elementToAddToScene, {
		material: new THREE.MeshPhongMaterial({
			color: 'rgb(255,255,255)',
			shininess: 10,
			//combine: THREE.MixOperation,
			reflectivity: 400,
			specular: 0xffffff,
			anisotropy: 16,
			bumpScale  :  0.1,
		}),
		heavyDiff: true,
		//styleObserverDisabled: true,
		//transitionsDisabled: true
	});



	//Since HTML-GL changes positions of displayObject on it`s own in accordance to HTML element coordinates
	//we should set up a wrapper to be able to set position we would like
	var wrapper = new THREE.Object3D();
	DEMO.ms_Scene.add(wrapper);

	wrapper.position.set(100, 700, 1000);
	wrapper.scale.set(200, 200, 1);
	wrapper.add(htmlglNode.displayObject);

	htmlglNode.renderer.registerScene(DEMO.ms_Scene, DEMO.ms_Camera);

	window.scene = DEMO.ms_Scene;

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
	};

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {

		console.log( item, loaded, total );

	};

	var boat = null;
	var waveBoat = function(){
		var angle = Math.sin(Date.now() * 0.001) * 0.0015;
		boat.rotateX(angle);
		requestAnimationFrame(waveBoat);
	};

	var loader = new THREE.OBJLoader( manager );
	loader.load( './assets/3d-model.obj', function ( object ) {

		boat = object;
		object.position.set(-200, -20, 1000);
		object.scale.set(0.2, 0.2, 0.2);
		DEMO.ms_Scene.add( object );

		requestAnimationFrame(waveBoat);

	}, onProgress, onError );

	WINDOW.resizeCallback = function(inWidth, inHeight) { DEMO.resize(inWidth, inHeight); };
	DEMO.resize(WINDOW.ms_Width, WINDOW.ms_Height);
	
	mainLoop();
});