(function (w) {
    w.HTMLGL = {
        context: undefined,
        stage: undefined,
        elements: []
    };

    var HTMLGL = function () {
        w.HTMLGL.context = this;

        this.createStage();
        this.addListenerers();

        if (!document.body) {
            document.addEventListener("DOMContentLoaded", this.init.bind(this));
        } else {
            this.init();
        }
    }

    var p = HTMLGL.prototype;

    p.init = function () {
        this.createViewer();
        this.resizeViewer();
        this.appendViewer();
    }

    p.addListenerers = function () {
        w.addEventListener('scroll', this.onScroll.bind(this));
        w.addEventListener('resize', this.resizeViewer.bind(this));
        document.addEventListener('click', this.onMouseEvent.bind(this), true);
        document.addEventListener('mousemove', this.onMouseEvent.bind(this), true);
        document.addEventListener('mouseup', this.onMouseEvent.bind(this), true);
        document.addEventListener('mousedown', this.onMouseEvent.bind(this), true);
        document.addEventListener('touchstart', this.onMouseEvent.bind(this));
        document.addEventListener('touchend', this.onMouseEvent.bind(this));
    }

    p.onScroll = function () {
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

    p.createViewer = function () {
        this.renderer = PIXI.autoDetectRenderer(0, 0, {transparent: true});
        this.renderer.view.style.position = 'fixed';
        this.renderer.view.style.top = '0px';
        this.renderer.view.style.left = '0px';
        this.renderer.view.style['pointer-events'] = 'none';
        this.renderer.view.style['pointerEvents'] = 'none';
    }

    p.appendViewer = function () {
        document.body.appendChild(this.renderer.view);
        requestAnimFrame(this.redraw.bind(this));
    }

    p.resizeViewer = function () {
        var width = w.innerWidth,
            height = w.innerHeight;

        this.renderer.resize(width, height);
        this.stage.changed = true;
    }

    p.createStage = function () {
        w.HTMLGL.stage = this.stage = new PIXI.Stage(0xFFFFFF);
        w.HTMLGL.document = this.document = new PIXI.DisplayObjectContainer();
        this.stage.addChild(w.HTMLGL.document);
    }

    p.redraw = function () {
        requestAnimFrame(this.redraw.bind(this));

        if (this.stage.changed) {
            this.renderer.render(this.stage);
            this.stage.changed = false;
        }
    }

    p.onMouseEvent = function (event) {
        var x = event.x || event.pageX,
            y = event.y || event.pageY,
            element = event.dispatcher !== 'html-gl' ? this.getGLElementByCoordinates(x, y) : null;

        element ? this.emitEvent(element, event) : null;
    }

    p.getGLElementByCoordinates = function (x, y) {
        var element,
            self = this,
            result;

        function isContained(child, parent) {
            var current = child;
            while (current) {
                if (current === parent) return true;
                current = current.parentNode;
            }
            return false;
        }

        w.HTMLGL.elements.forEach(function (glelement) {
            element = document.elementFromPoint(x - parseInt(glelement.transformObject.translateX || 0), y - parseInt(glelement.transformObject.translateY || 0))
            if (isContained(element, glelement)) {
                result = element;
            }
        });
        return result;
    }

    p.emitEvent = function (element, event) {
        var newEvent = new MouseEvent(event.type, event);
        newEvent.dispatcher = 'html-gl';
        event.stopPropagation();
        element.dispatchEvent(newEvent);
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