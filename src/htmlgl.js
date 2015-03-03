(function (w) {
    var HTMLGL = function (w) {
        this.elements = [];
        this.init();
    }

    var p = HTMLGL.prototype;

    p.init = function () {
        this.createContext();
        this.findAllElements();
    }

    p.findAllElements = function () {
        var elements = document.getElementsByTagName('webgl');
        for (var i = 0; i < elements.length; i++) {
            this.elements.push(new RasterizedElement(elements[i], this.stage));
        }
    }

    p.createContext = function () {
        var width = w.innerWidth,
            height = w.innerHeight;

        this.stage = new PIXI.Stage(0xFFFFFF);
        this.renderer = PIXI.autoDetectRenderer(width, height, {transparent:true});
        this.renderer.view.style.position = 'absolute';
        this.renderer.view.style.top = '0px';
        this.renderer.view.style.left = '0px';

        document.body.appendChild(this.renderer.view);
        this.renderer.view.style['pointer-events'] = 'none';

        requestAnimFrame(this.animate.bind(this));
    }

    p.animate = function(){
        requestAnimFrame(this.animate.bind(this));
        this.renderer.render(this.stage);
    }

    w.HTMLGL = HTMLGL;

    new HTMLGL();
})(window);

function getterSetter(variableParent, variableName, getterFunction, setterFunction){
    if (Object.defineProperty)
    {
        Object.defineProperty(variableParent, variableName, {
            get: getterFunction,
            set: setterFunction
        });
    }
    else if (document.__defineGetter__)
    {
        variableParent.__defineGetter__(variableName, getterFunction);
        variableParent.__defineSetter__(variableName, setterFunction);
    }

    variableParent["get" + variableName] = getterFunction;
    variableParent["set" + variableName] = setterFunction;
}