//var THREE = require("three-js")();

var THREERenderer = {
    createDisplayObject: function () {
        var result = new THREE.Object3D();
        return result;
    },

    // imageData is a HTMLCanvas instance or HTMLImage
    setTexture: function (node, imageData) {

        if (!node.sprite) {
            var texture = new THREE.Texture(imageData)
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial(
                {map: texture, useScreenCoordinates: false});
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(100, 50, 1.0);

            node.displayObject.add(sprite);
        }
    }
};

module.exports = THREERenderer;