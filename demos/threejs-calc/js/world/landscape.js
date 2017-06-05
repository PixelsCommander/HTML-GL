(function(w){
    var Landscape = function(scene){

        var light = new THREE.AmbientLight( 0xffffff, 0.75 ); // soft white light
        scene.add( light );

        var material = new THREE.MeshPhongMaterial( {
            color: 'rgb(131,184,170)',
            shininess: 0,
            wireframe: true
            //specular: 'rgb(39,45,77)'
        } );

        material.shading = THREE.FlatShading;

        var xS = 20, yS = 20;
        terrainScene = THREE.Terrain({
            easing: THREE.Terrain.Linear,
            frequency: 2.5,
            heightmap: THREE.Terrain.PERLIN_LAYERS,
            material: material,
            maxHeight: 0,
            minHeight: -10,
            steps: 10,
            useBufferGeometry: true,
            xSegments: xS,
            xSize: 300,
            ySegments: yS,
            ySize: 300
        });
        scene.add(terrainScene);
        terrainScene.position.set(0, -5, 0);
        return terrainScene;
    }

    w.Landscape = Landscape;
})(window)