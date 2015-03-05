(function (w) {
    w.HTMLGL = {
        context: undefined,
        stage: undefined,
        elements: []
    };

    var HTMLGL = function () {
        w.HTMLGL.context = this;

        this.createStage();
        this.addScrollListener();

        if (!document.body) {
            document.addEventListener("DOMContentLoaded", this.createViewer.bind(this));
        } else {
            this.createViewer();
        }
    }

    var p = HTMLGL.prototype;

    p.addScrollListener = function () {
        w.addEventListener('scroll', this.onScroll.bind(this));
    }

    p.onScroll = function (event) {
        var scrollOffset = {};

        if (window.pageYOffset != undefined) {
            scrollOffset = {
                left: pageXOffset,
                top: pageYOffset
            };
        } else {
            var sx, sy, d = document, r = d.documentElement, b = d.body;
            sx = r.scrollLeft || b.scrollLeft || 0;
            sy = r.scrollTop || b.scrollTop || 0;
            scrollOffset = {
                left: sx,
                top: sy
            };
        }
        this.document.x = -scrollOffset.left;
        this.document.y = -scrollOffset.top;

        this.stage.changed = true;
    }

    p.redraw = function () {
        requestAnimFrame(this.redraw.bind(this));

        if (this.stage.changed) {
            this.renderer.render(this.stage);
            this.stage.changed = false;
        }
    }

    p.createViewer = function () {
        var width = w.innerWidth,
            height = w.innerHeight;

        this.renderer = PIXI.autoDetectRenderer(width, height, {transparent: true});
        this.renderer.view.style.position = 'fixed';
        this.renderer.view.style.top = '0px';
        this.renderer.view.style.left = '0px';

        document.body.appendChild(this.renderer.view);
        this.renderer.view.style['pointer-events'] = 'none';

        requestAnimFrame(this.redraw.bind(this));
    }

    p.createStage = function () {
        w.HTMLGL.stage = this.stage = new PIXI.Stage(0xFFFFFF);
        w.HTMLGL.document = this.document = new PIXI.DisplayObjectContainer();
        this.stage.addChild(w.HTMLGL.document);
    }

    new HTMLGL();
})(window);

function getterSetter(variableParent, variableName, getterFunction, setterFunction) {
    if (Object.defineProperty) {
        Object.defineProperty(variableParent, variableName, {
            get: getterFunction,
            set: setterFunction
        });
    }
    else if (document.__defineGetter__) {
        variableParent.__defineGetter__(variableName, getterFunction);
        variableParent.__defineSetter__(variableName, setterFunction);
    }

    variableParent["get" + variableName] = getterFunction;
    variableParent["set" + variableName] = setterFunction;
}