/*
    Take into account
    - updateTexture is expensive
    - updateSpriteTransform is cheap
 */

(function (w) {

    var GLElement = function (element, stage) {
        this.element = element;
        this.element.renderer = 'webgl';
        this.CSSText = '';
        this.transformString = '';
        this.transformObject = {};
        this.boundingRect = {};
        this.image = {};
        this.stage = stage;
        this.sprite = {};
        this.texture = {};
        this.bindCallbacks();
        this.init();
    }

    var p = GLElement.prototype;

    p.init = function () {
        this.updateTexture();
        this.initObservers();
        this.patchStyleGLTransform();
    }

    p.updateTexture = function () {
        var self = this;
        imagesLoaded(this.element, function () {
            self.updateBoundingRect();
            self.image = html2canvas(self.element, {
                onrendered: self.applyNewTexture,
                width: self.boundingRect.width,
                height: self.boundingRect.height
            });
        });
    }

    p.applyNewTexture = function (textureCanvas) {
        this.image = textureCanvas;
        this.texture = PIXI.Texture.fromCanvas(this.image);

        if (!this.sprite.texture) {
            this.sprite = new PIXI.Sprite(this.texture);
            this.stage.addChild(this.sprite);
        } else {
            this.sprite.setTexture(this.texture);
        }

        this.updateSpriteTransform();
    }

    p.updateSpriteTransform = function () {
        var translateX = parseFloat(this.transformObject.translateX) || 0,
            translateY = parseFloat(this.transformObject.translateY) || 0,
            scaleX = parseFloat(this.transformObject.scaleX) || 1,
            scaleY = parseFloat(this.transformObject.scaleY) || 1,
            rotate = (parseFloat(this.transformObject.rotateZ) / 180) * Math.PI || 0;

        if (this.sprite && this.sprite.position) {
            this.sprite.position.x = this.boundingRect.left + translateX;
            this.sprite.position.y = this.boundingRect.top + translateY;
            this.sprite.scale.x = scaleX;
            this.sprite.scale.y = scaleY;
            this.sprite.rotation = rotate;
        }
    }

    p.updateBoundingRect = function () {
        this.boundingRect = this.element.getBoundingClientRect();
    }

    p.initObservers = function () {
        //TODO Better heuristics for rerendering condition #2
        var self = this;
        var observer = new MutationObserver(function (mutations) {
            if (mutations[0].attributeName === 'style') {
                self.transformObject = self.getTransformObjectFromString(self.element.style.transform);
                self.updateSpriteTransform();
                this.hideDOM();
            } else {
                self.updateTexture();
            }
        });

        var config = {
            childList: true,
            characterData: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        };

        observer.observe(this.element, config);
    }

    p.patchStyleGLTransform = function () {
        var self = this;
        self.element.styleGl = {};

        getterSetter(this.element.styleGl, 'transform',
            function () {
                return self.transformObject;
            },
            function (value) {
                self.transformObject = self.getTransformObjectFromString(value);
                self.updateSpriteTransform();
            }
        )
    }

    p.getTransformObjectFromString = function (transformString) {
        return (transformString.match(/([\w]+)\(([^\)]+)\)/g) || [])
            .map(function (it) {
                return it.replace(/\)$/, "").split(/\(/)
            })
            .reduce(function (m, it) {
                return m[it[0]] = it[1], m
            }, {});
    }

    p.hideDOM = function () {
        this.element.style.visibility = 'hidden';
    }

    p.bindCallbacks = function () {
        this.applyNewTexture = this.applyNewTexture.bind(this);
    }

    w.GLElement = GLElement;
})(window);
