/**
 * @author mattatz / http://mattatz.github.io/
 */

THREE.BloomBlendPass = function ( amount, opacity, resolution ) {

    this.amount = ( amount !== undefined ) ? amount : 1.0;
    this.opacity = ( opacity !== undefined ) ? opacity : 1.0;
    this.resolution = ( resolution !== undefined ) ? resolution : new THREE.Vector2(512, 512);

    // render targets

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

    this.renderTargetX = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, pars );
    this.renderTargetY = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, pars );

    var kernel = [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" );

    this.blurMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            "tDiffuse" : { type : "t", value : null },
            "increment" : { type : "v2", value : new THREE.Vector2() }
        },
        vertexShader: kernel,
        fragmentShader: [

            "uniform sampler2D tDiffuse;",

            "uniform vec2 increment;",

            "varying vec2 vUv;",

            "void main() {",

            "vec4 color = vec4(0.0);",

            "color += texture2D(tDiffuse, (vUv - increment * 4.0)) * 0.051;",
            "color += texture2D(tDiffuse, (vUv - increment * 3.0)) * 0.0918;",
            "color += texture2D(tDiffuse, (vUv - increment * 2.0)) * 0.12245;",
            "color += texture2D(tDiffuse, (vUv - increment * 1.0)) * 0.1531;",
            "color += texture2D(tDiffuse, (vUv + increment * 0.0)) * 0.1633;",
            "color += texture2D(tDiffuse, (vUv + increment * 1.0)) * 0.1531;",
            "color += texture2D(tDiffuse, (vUv + increment * 2.0)) * 0.12245;",
            "color += texture2D(tDiffuse, (vUv + increment * 3.0)) * 0.0918;",
            "color += texture2D(tDiffuse, (vUv + increment * 4.0)) * 0.051;",

            "gl_FragColor = color;",

            "}"

        ].join( "\n" ),
    } );

    this.blendMaterial = new THREE.ShaderMaterial( {
        uniforms : {
            "tDiffuse" : { type : "t", value : null },
            "tBlend" : { type : "t", value : null },
            "opacity" : { type : "f", value : this.opacity },
        },
        vertexShader : kernel,
        fragmentShader : [

            "uniform sampler2D tDiffuse;",
            "uniform sampler2D tBlend;",
            "uniform float opacity;",

            "varying vec2 vUv;",

            "void main() {",

            "vec4 base = texture2D(tDiffuse, vUv);",
            "vec4 blend = texture2D(tBlend, vUv);",

            // screen blending
            "vec4 color = (1.0 - ((1.0 - base) * (1.0 - blend)));",
            "gl_FragColor = color * opacity + base * ( 1. - opacity );",

            "}"

        ].join( "\n" )
    } );

    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.BloomBlendPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

        this.quad.material = this.blurMaterial;

        // horizontal blur
        this.blurMaterial.uniforms[ "tDiffuse" ].value = readBuffer;
        this.blurMaterial.uniforms[ "increment" ].value.set( this.amount / readBuffer.width, 0.0 );

        renderer.render( this.scene, this.camera, this.renderTargetX, false);

        // vertical blur
        this.blurMaterial.uniforms[ "tDiffuse" ].value = this.renderTargetX;
        this.blurMaterial.uniforms[ "increment" ].value.set( 0.0, this.amount / this.renderTargetX.height);

        renderer.render( this.scene, this.camera, this.renderTargetY, false);

        // screen blending original buffer and blurred buffer

        this.quad.material = this.blendMaterial;

        this.blendMaterial.uniforms[ "tDiffuse" ].value = readBuffer;
        this.blendMaterial.uniforms[ "tBlend" ].value = this.renderTargetY;
        this.blendMaterial.uniforms[ "opacity" ].value = this.opacity;

        if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

        if( this.renderToScreen ) {
            renderer.render( this.scene, this.camera );
        } else {
            renderer.render( this.scene, this.camera, writeBuffer, this.clear );
        }
    }

};

