(function (w) {
    w.HTMLGL = {
        stage: undefined,
        elements: []
    };

    var HTMLGL = function () {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", this.init.bind(this));
        } else {
            this.init();
        }
    }

    var p = HTMLGL.prototype;

    p.init = function () {
        this.createContext();
        w.HTMLGL.elements.forEach(function (element) {
            if (!element.haveSprite()) {
                element.applyNewTexture(element.image);
            }
        });
    }

    p.createContext = function () {
        var width = w.innerWidth,
            height = w.innerHeight;

        w.HTMLGL.stage = this.stage = new PIXI.Stage(0xFFFFFF);
        this.renderer = PIXI.autoDetectRenderer(width, height, {transparent: true});
        this.renderer.view.style.position = 'absolute';
        this.renderer.view.style.top = '0px';
        this.renderer.view.style.left = '0px';

        document.body.appendChild(this.renderer.view);
        this.renderer.view.style['pointer-events'] = 'none';

        requestAnimFrame(this.animate.bind(this));
    }

    p.animate = function () {
        requestAnimFrame(this.animate.bind(this));
        this.renderer.render(this.stage);
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