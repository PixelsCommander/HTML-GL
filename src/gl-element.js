/*
 * GLElement is a part of HTML GL library describing single HTML-GL element
 * Copyright (c) 2015 pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 *
 * Please, take into account:
 * - updateTexture is expensive
 * - updateSpriteTransform is cheap
 * */

(function (w) {
    var p = Object.create(HTMLElement.prototype),
        style = document.createElement('style');

    //Default styling for html-gl elements
    style.innerHTML = HTMLGL.CUSTOM_ELEMENT_TAG_NAME + ' { display: inline-block; transform: translateZ(0);}';
    document.head.appendChild(style);

    p.createdCallback = function () {
        //Checking is node created inside of html2canvas virtual window or not. We do not need WebGL there
        var currentNode = this,
            isMounted = false;

        while (currentNode = currentNode.parentNode) {
            if (currentNode.tagName === 'BODY') {
                isMounted = true;
            }
        }

        var isInsideHtml2Canvas = !isMounted || (this.baseURI === undefined || this.baseURI === '' || this.baseURI === null);

        if (!isInsideHtml2Canvas) {
            HTMLGL.elements.push(this);
            //Needed to determine is element WebGL rendered or not relying on tag name
            this.setAttribute('renderer', 'webgl');
            this.renderer = 'webgl';

            this.transformObject = {};
            this.boundingRect = {};
            this.image = {};
            this.sprite = new PIXI.Sprite();
            this.texture = {};

            this.halfWidth = 0;
            this.halfHeight = 0;

            this.observer = undefined;

            this.glChilds = [];
            this.glChildsReady = 0;
            this.glParent = this.getGlParent();

            this.initEffects();
            this.bindCallbacks();
            this.transformProperty = this.style.transform !== undefined ? 'transform' : 'WebkitTransform';
            this.init();
        }
    }

    p.init = function () {
        this.notifyGlParent();
        this.updateTexture();
        this.initObservers();
        this.patchStyleGLTransform();
    }

    p.getGlParent = function () {
        var parent = this,
            tagName = HTMLGL.CUSTOM_ELEMENT_TAG_NAME.toUpperCase();

        while (parent) {
            parent = parent.parentNode;

            if (parent && parent.tagName === tagName) {
                return parent;
            } else if (parent === w.document) {
                return null;
            }
        }
    }

    //Notify GL parent about one more HTML GL child in the tree
    p.notifyGlParent = function () {
        if (this.glParent) {
            this.glParent.addGlChild(this);
        }
    }

    p.addGlChild = function (child) {
        this.glChilds.push(child);
    }

    p.glChildReady = function () {
        this.glChildsReady++;
        this.dispatchReady();
    }

    //If all my childs ready notify parent that I am
    p.dispatchReady = function () {
        if (this.isReady()) {
            var event = new Event(HTMLGL.READY_EVENT);
            this.dispatchEvent(event);

            if (this.glParent) {
                //Inform parent
                this.glParent.glChildReady();
            }
        }
    }

    p.isReady = function () {
        return (this.glChilds.length - this.glChildsReady === 0) && this.haveSprite();
    }

    //Updating bounds, waiting for all images to load and calling rasterization then
    p.updateTexture = function () {
        var self = this;
        self.updateBoundingRect();

        return new Promise(function(resolve, reject){
            self.image = html2canvas(self, {
                width: self.boundingRect.width * HTMLGL.pixelRatio,
                height: self.boundingRect.height * HTMLGL.pixelRatio
            }).then(function(textureCanvas){
                self.applyNewTexture(textureCanvas);
                resolve();
            });
        });
    }

    //Recreating texture from canvas given after calling updateTexture
    p.applyNewTexture = function (textureCanvas) {
        this.image = textureCanvas;
        this.texture = PIXI.Texture.fromCanvas(this.image);

        if (!this.haveSprite()) {
            this.initSprite(this.texture);
        } else {
            this.sprite.texture.destroy();
            this.sprite.texture = this.texture;
        }

        this.updatePivot();
        this.updateSpriteTransform();

        HTMLGL.context.markStageAsChanged();
    }

    //Just updates WebGL representation coordinates and transformation
    p.updateSpriteTransform = function () {

        //TODO add 3d rotation support
        var translateX = parseFloat(this.transformObject.translateX) || 0,
            translateY = parseFloat(this.transformObject.translateY) || 0,
            scaleX = parseFloat(this.transformObject.scaleX) || 1,
            scaleY = parseFloat(this.transformObject.scaleY) || 1,
            rotate = (parseFloat(this.transformObject.rotateZ) / 180) * Math.PI || 0;

        if (this.sprite && this.sprite.position) {
            this.sprite.position.x = (this.boundingRect.left + translateX) * HTMLGL.pixelRatio + this.halfWidth;
            this.sprite.position.y = (this.boundingRect.top + translateY) * HTMLGL.pixelRatio + this.halfHeight;
            this.sprite.scale.x = scaleX;
            this.sprite.scale.y = scaleY;
            this.sprite.rotation = rotate;
        }

        HTMLGL.context.markStageAsChanged();
    }

    //Getting bounding rect with respect to current scroll position
    p.updateBoundingRect = function () {
        var boundingRect = this.getBoundingClientRect();

        this.boundingRect = {
            left: boundingRect.left,
            right: boundingRect.right,
            top: boundingRect.top,
            bottom: boundingRect.bottom,
            width: boundingRect.width,
            height: boundingRect.height,
        };

        if (this.glParent && this.glParent.boundingRect) {
            this.boundingRect.left -= this.glParent.boundingRect.left;
            this.boundingRect.top -= this.glParent.boundingRect.top;
        }

        this.boundingRect.left = HTMLGL.scrollX + parseFloat(this.boundingRect.left);
        this.boundingRect.top = HTMLGL.scrollY + parseFloat(this.boundingRect.top);
    }

    //Correct pivot needed to rotate element around it`s center
    p.updatePivot = function () {
        this.halfWidth = this.sprite.width / 2;
        this.halfHeight = this.sprite.height / 2;
        this.sprite.pivot.x = this.halfWidth;
        this.sprite.pivot.y = this.halfHeight;
    }

    p.initSprite = function (texture) {
        var self = this,
            parentSprite = this.glParent && this.glParent.sprite || w.HTMLGL.document;

        this.sprite.texture = texture;
        parentSprite.addChild(this.sprite);

        setTimeout(function () {
            self.hideDOM();
            //Notify parents that I am initialized
            self.dispatchReady();
        }, 0);
    }

    p.initObservers = function () {
        //TODO Better heuristics for rerendering condition #2
        var self = this,
            config = {
                childList: true,
                characterData: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style']
            };

        this.observer = this.observer || new MutationObserver(function (mutations) {
            if (mutations[0].attributeName === 'style') {
                self.transformObject = self.getTransformObjectFromString(self.style[self.transformProperty]);
                self.updateSpriteTransform();
            } else {
                self.updateTexture();
            }
        });

        this.observer.observe(this, config);
    }

    p.patchStyleGLTransform = function () {
        var self = this;
        self.styleGL = {};

        HTMLGL.util.getterSetter(this.styleGL, this.transformProperty, function () {
                var result = '';

                for (var transformPropertyName in self.transformObject) {
                    var transformPropertyValue = '(' + self.transformObject[transformPropertyName] + ') ';
                    result += transformPropertyName + transformPropertyValue;
                }

                return result;
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
        this.style.opacity = 0;
    }

    p.bindCallbacks = function () {
        this.applyNewTexture = this.applyNewTexture.bind(this);
    }

    p.haveSprite = function () {
        return this.sprite.stage;
    }

    p.initEffects = function () {
        if (HTMLGL.GLEffectsManager) {
            this.effectsManager = new HTMLGL.GLEffectsManager(this);
        }
    }

    HTMLGL.GLElement = document.registerElement(HTMLGL.CUSTOM_ELEMENT_TAG_NAME, {
        prototype: p
    })

    HTMLGL.GLElement.createFromNode = function (node) {
        //Extending node with GLElement methods
        for (var i in p) {
            if (p.hasOwnProperty(i)) {
                node[i] = p[i];
            }
        }

        p.createdCallback.apply(node);
        return node;
    }

    //Wrap to jQuery plugin
    if (w.jQuery !== undefined) {
        jQuery[HTMLGL.JQ_PLUGIN_NAME] = {};
        jQuery[HTMLGL.JQ_PLUGIN_NAME].elements = [];

        jQuery.fn[HTMLGL.JQ_PLUGIN_NAME] = function () {
            return this.each(function () {
                if (!jQuery.data(this, 'plugin_' + HTMLGL.JQ_PLUGIN_NAME)) {
                    var htmlGLobj = HTMLGL.GLElement.createFromNode(this);
                    jQuery.data(this, 'plugin_' + HTMLGL.JQ_PLUGIN_NAME, htmlGLobj);
                    jQuery[HTMLGL.JQ_PLUGIN_NAME].elements.push(propellerObj);
                }
            });
        };
    }
})(window);