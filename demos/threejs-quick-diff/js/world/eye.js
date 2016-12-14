(function(w){

    var eyeTexture = new THREE.ImageUtils.loadTexture("./img/eyetexture.jpg");
    eyeTexture.repeat.set(2, 2);
    eyeTexture.offset.x = -0.35;
    eyeTexture.offset.y = -0.6;

    var Eye = function(scene, three){

        var self = this;

        this.model = new THREE.Object3D();

        this.reflectionCamera = new THREE.CubeCamera( 1, 1000, 256 );
        this.reflectionCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.model.add( this.reflectionCamera );
        this.reflectionCamera.position.set(0, 0, 0);

        var geometry = new THREE.SphereGeometry( 3, 32, 32 );
        var material = new THREE.MeshPhongMaterial( {
            color: 'rgb(255,255,255)',
            shininess: 320,
            combine: THREE.MixOperation,
            envMap: this.reflectionCamera.renderTarget.texture,
            map: eyeTexture,
            //color: 0x444444,
            reflectivity: 0.2,
            specular: 0xffffff,
            //emissive: 'rgb(100, 100, 100)'
        } );

        var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
        for ( i = 0; i < faceVertexUvs.length; i ++ ) {

            var uvs = faceVertexUvs[ i ];
            var face = geometry.faces[ i ];

            for ( var j = 0; j < 3; j ++ ) {

                uvs[ j ].x = face.vertexNormals[ j ].x * 0.5 + 0.5;
                uvs[ j ].y = face.vertexNormals[ j ].y * 0.5 + 0.5;
            }
        }

        this.sphere = new THREE.Mesh( geometry, material );

        three.on('update', function(){
            material.envMap = self.reflectionCamera.renderTarget.texture;
            self.reflectionCamera.updateCubeMap( three.renderer, scene );
        });

        this.model.add( this.sphere );
        scene.add(this.model);
    }

    var p = Eye.prototype;

    p.initRotation = function() {
        this.sphere.roll
    }

    Object.defineProperty(p, 'x', {
        get: function() { return this.model.position.x; },
        set: function(newValue) { this.model.position.x = newValue; }
    });

    Object.defineProperty(p, 'y', {
        get: function() { return this.model.position.z; },
        set: function(newValue) { this.model.position.z = newValue; }
    });

    w.Eye = Eye;
})(window)