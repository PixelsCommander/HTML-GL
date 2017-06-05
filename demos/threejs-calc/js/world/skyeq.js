(function (w) {

    var NORMAL_INTENSITY = 0.75;
    var MIN_INTENSITY = 0.3;
    var DISTANCE = 500;

    var SkyEQ = function (scene, three) {

        this.scene = scene;

        var uniforms = {
            volume: {value: 0.0},
            time: {value: 1.0},
            resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        }

        var shaderMaterial = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: uniforms,
            fragmentShader: document.getElementById('fragmentShader').textContent,
            vertexShader: document.getElementById('vertexShader').textContent
        });

        var basicMaterial = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 'rgb(39,45,77)',
            wireframe: false
        });

        var materials = [
            shaderMaterial, shaderMaterial, basicMaterial, basicMaterial, shaderMaterial, shaderMaterial
        ];

        var geometry = new THREE.CubeGeometry(2000, 800, 2000, 1, 1, 1, materials);
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        mesh.position.y = 330;
        scene.add(mesh);

        three.on('update', function () {
            uniforms.time.value = new Date().getMilliseconds();
        });

        var lights = this.createEQLights([
            [131, 184, 170],
            [255, 179, 80],
            [255, 106, 90],
            [184, 53, 100],
            [39, 45, 77]
        ]);

        var tween = new TWEEN.Tween(uniforms.volume);

        requestAnimationFrame(animate);

        function animate(time) {
            requestAnimationFrame(animate);
            TWEEN.update(time);
        }

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                    audio: true
                },
                function (stream) {
                    audioContext = new AudioContext();
                    analyser = audioContext.createAnalyser();

                    var mediaElement = document.getElementById('player');
                    //var microphone = audioContext.createMediaElementSource(mediaElement);



                    var microphone = audioContext.createMediaStreamSource(stream);
                    javascriptNode = audioContext.createScriptProcessor(512, 1, 1);

                    filter = audioContext.createBiquadFilter();
                    filter.type = "lowpass";

                    analyser.smoothingTimeConstant = 0.0;
                    analyser.fftSize = 1024;

                    microphone.connect(filter);
                    filter.connect(analyser);
                    analyser.connect(javascriptNode);
                    javascriptNode.connect(audioContext.destination);

                    var tweening = false;

                    javascriptNode.onaudioprocess = function () {
                        var array = new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(array);
                        var values = 0;

                        var length = array.length / 2;
                        for (var i = 0; i < length; i++) {
                            values += array[i];
                        }

                        var average = values / length;

                        var volume = average / 20;

                        if (volume > MIN_VOLUME_TO_REACT && !tweening) {

                            tweening = true;
                            tween.to({value: volume}, MIN_EQ_TWEEN_TIME + 200 * volume)
                                .onUpdate(function(e){

                                    var lightSize = 1 / (lights.length - 1);
                                    var lightsOn = e / lightSize;

                                    for (var i = 0; i < lightsOn; i++) {
                                        lights[i].intensity = NORMAL_INTENSITY;
                                    }

                                    lights[Math.floor(lightsOn)].intensity = NORMAL_INTENSITY * (lightsOn % 1);
                                })
                                .onComplete(function () {
                                    tween.delay(TIME_ON_PEAK)
                                        .to({value: 0}, FALL_DAWN_TIME)
                                        .onUpdate(function(e){

                                            var lightSize = 1 / (lights.length - 1);
                                            var lightsOn = e / lightSize;

                                            for (var i = 0; i < lightsOn; i++) {
                                                lights[i].intensity = NORMAL_INTENSITY;
                                            }

                                            lights[Math.floor(lightsOn)].intensity = NORMAL_INTENSITY * (lightsOn % 1);
                                        })
                                        .onComplete(function () {
                                            for (var i = 0; i < lights.length; i++) {
                                                lights[i].intensity = MIN_INTENSITY;
                                            }
                                            tweening = false;
                                        })
                                        .start();
                                })
                                .start();
                        }
                    }
                },
                function (err) {
                    console.log("The following error occured: " + err.name)
                });
        } else {
            console.log("getUserMedia not supported");
        }
    }

    var p = SkyEQ.prototype;

    p.createEQLight = function (color, position) {
        /* var dirLight = new THREE.DirectionalLight(color, 0.1);
        dirLight.shadowCameraVisible = true;
        dirLight.shadowCameraNear = 1;
        dirLight.shadowCameraFar = 150;
        dirLight.castshadow = true;
        dirLight.position = position;
        this.scene.add(dirLight); */

        var light = new THREE.PointLight(color, MIN_INTENSITY, DISTANCE);
        light.position.set(position.x, position.y, position.z);
        scene.add(light);

        return light;
    }

    p.createEQLights = function (colors) {
        var self = this;

        return colors.map(function (rgb, index) {
            var position = new THREE.Vector3(0, 100 * (index + 0.5), 0);
            return self.createEQLight(new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255), position);
        });
    }

    w.SkyEQ = SkyEQ;
})(window)