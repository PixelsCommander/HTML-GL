/*
    Take into account
    - updateTexture is expensive
    - updateSpriteTransform is cheap
 */

(function (w) {
    var CUSTOM_ELEMENT_TAG_NAME = 'html-gl',
        p = Object.create(HTMLElement.prototype);

    p.createdCallback = function () {
        if (this.baseURI.length > 0) {
            w.HTMLGL.elements.push(this);
            this.renderer = 'webgl';
            this.transformObject = {};
            this.boundingRect = {};
            this.image = {};
            this.sprite = {};
            this.texture = {};
            this.bindCallbacks();
            this.init();
        }
    }

    p.init = function () {
        this.updateTexture();
        this.initObservers();
        this.patchStyleGLTransform();
    }

    p.updateTexture = function () {
        var self = this;
        new HTMLGL.ImagesLoaded(self, function () {
            self.updateBoundingRect();
            self.image = html2canvas(self, {
                onrendered: self.applyNewTexture,
                width: self.boundingRect.width,
                height: self.boundingRect.height
            });
        });
    }

    p.applyNewTexture = function (textureCanvas) {
        this.image = textureCanvas;
        this.texture = PIXI.Texture.fromCanvas(this.image);

        if (!this.haveSprite()) {
            if (w.HTMLGL.stage) {
                this.sprite = new PIXI.Sprite(this.texture);
                w.HTMLGL.stage.addChild(this.sprite);
                this.hideDOM();
            }
        } else {
            this.sprite.setTexture(this.texture);
        }

        this.updateSpriteTransform();
        this.markStageAsChanged();
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
        this.markStageAsChanged();
    }

    p.updateBoundingRect = function () {
        this.boundingRect = this.getBoundingClientRect();
    }

    p.initObservers = function () {
        //TODO Better heuristics for rerendering condition #2
        var self = this;
        var observer = new MutationObserver(function (mutations) {
            if (mutations[0].attributeName === 'style') {
                self.transformObject = self.getTransformObjectFromString(self.style.transform);
                self.updateSpriteTransform();
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

        observer.observe(this, config);
    }

    p.patchStyleGLTransform = function () {
        var self = this;
        self.styleGl = {};

        getterSetter(this.styleGl, 'transform',
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
        this.style.visibility = 'hidden';
    }

    p.bindCallbacks = function () {
        this.applyNewTexture = this.applyNewTexture.bind(this);
    }

    p.haveSprite = function() {
        return this.sprite.stage;
    }

    p.markStageAsChanged = function() {
        if (w.HTMLGL.stage && !w.HTMLGL.stage.changed) {
            w.HTMLGL.stage.changed = true;
        }
    }

    w.GLElement = document.registerElement(CUSTOM_ELEMENT_TAG_NAME, {
        prototype: p
    });
})(window);