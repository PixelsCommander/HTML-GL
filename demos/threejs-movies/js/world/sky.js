(function (w) {

    var NORMAL_INTENSITY = 0.75;
    var MIN_INTENSITY = 0.3;
    var DISTANCE = 500;

    var Sky = function (scene, three) {

        this.scene = scene;

        var aCubeMap = THREE.ImageUtils.loadTextureCube([
            './img/px.jpg',
            './img/nx.jpg',
            './img/py.jpg',
            './img/ny.jpg',
            './img/pz.jpg',
            './img/nz.jpg'
        ]);
        aCubeMap.format = THREE.RGBFormat;

        var aShader = THREE.ShaderLib['cube'];
        aShader.uniforms['tCube'].value = aCubeMap;

        var aSkyBoxMaterial = new THREE.ShaderMaterial({
            fragmentShader: aShader.fragmentShader,
            vertexShader: aShader.vertexShader,
            uniforms: aShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        var aSkybox = new THREE.Mesh(
            new THREE.BoxGeometry(1000000, 1000000, 1000000),
            aSkyBoxMaterial
        );

        this.scene.add(aSkybox);
    }

    var p = Sky.prototype;

    w.Sky = Sky;
})(window)