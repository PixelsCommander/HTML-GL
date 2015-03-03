(function (w) {

    Element.prototype.style = {};

    var RasterizedElement = function (element, stage) {
        this.element = element;
        this.element.renderer = 'webgl';
        this.boundingRect = {};
        this.image = {};
        this.stage = stage;
        this.sprite = {};
        this.texture = {};
        this.transformObject = {};
        this.init();
    }

    var p = RasterizedElement.prototype;

    p.init = function () {
        this.updateImage();
        this.initObservers();
        this.patchTransform();
    }

    p.updateImage = function () {
        var self = this;
        imagesLoaded(this.element, function () {
            self.boundingRect = self.element.getBoundingClientRect();
            self.showTemporary();
            self.image = html2canvas(self.element, {
                onrendered: function (canvas) {
                    self.image = canvas;
                    self.texture = PIXI.Texture.fromCanvas(self.image);

                    if (!self.sprite.texture) {
                        self.sprite = new PIXI.Sprite(self.texture);
                        self.stage.addChild(self.sprite);
                    } else {
                        self.sprite.setTexture(self.texture);
                    }

                    self.updatePosition();

                    //self.hideTemporary();
                    setTimeout(function () {
                        self.temporaryHidden = false;
                    }, 0);
                },
                width: self.boundingRect.width,
                height: self.boundingRect.height
            });
        });
    }

    p.updatePosition = function () {
        var translateX = parseInt(this.transformObject.translateX) || 0,
            translateY = parseInt(this.transformObject.translateY) || 0;

        if (this.sprite && this.sprite.position) {
            this.sprite.position.x = this.boundingRect.left + translateX;
            this.sprite.position.y = this.boundingRect.top + translateY;
        }
    }

    p.initObservers = function () {
        var self = this;
        var observer = new MutationObserver(function (mutations) {
            if (!self.temporaryHidden) {
                if (mutations[0].attributeName === 'style') {
                    self.transformObject = self.getTransformObjectFromString(self.element.style.transform);
                    self.updatePosition();
                } else {
                    self.updateImage();
                }
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

    p.patchTransform = function () {
        var self = this;
        this.element.styleGl = {};
        getterSetter(this.element.styleGl, 'transform',
            function () {
                return self.transformObject;
            },
            function (value) {
                self.transformObject = self.getTransformObjectFromString(value);
                self.updatePosition();
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

    p.showTemporary = function () {
        this.temporaryHidden = true;
        this.element.style.visibility = 'hidden';
        this.element.style.opacity = '1';
    }

    w.RasterizedElement = RasterizedElement;
})(window);