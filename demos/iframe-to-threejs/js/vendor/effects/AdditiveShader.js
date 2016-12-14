THREE.AdditiveShader = {
    uniforms: {
        tDiffuse: { type: "t", value: 0, texture: null },
        tAdd: { type: "t", value: 1, texture: null },
        fCoeff: { type: "f", value: 1.0 }
    },

    vertexShader: [
        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"
    ].join("\n"),

        fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform sampler2D tAdd;",
        "uniform float fCoeff;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "vec4 add = texture2D( tAdd, vUv );",
        "gl_FragColor = texel + add * fCoeff;",

        "}"
    ].join("\n")
}