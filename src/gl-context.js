/*
 * GLContext is a part of HTML GL library describing rendering context
 * Copyright (c) 2015 pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 * */

(function (w) {

    //Defining global namespace with respect if exists
    HTMLGL = w.HTMLGL = w.HTMLGL || {};

    //Defining it`s properties
    HTMLGL.context = undefined;
    HTMLGL.stage = undefined;
    HTMLGL.renderer = undefined;
    HTMLGL.elements = [];

    //Cache for window`s scroll position, filled in by updateScrollPosition
    HTMLGL.scrollX = 0;
    HTMLGL.scrollY = 0;

    var GLContext = function () {
        w.HTMLGL.context = this;

        this.createStage();             //Creating stage before showing it
        console.log('context updated position');
        this.updateScrollPosition();    //Initialize scroll position for first time
        this.initListeners();
        this.elementResolver = new w.HTMLGL.GLElementResolver(this);

        //Wait for DOMContentLoaded and initialize viewer then
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", this.initViewer.bind(this));
        } else {
            this.initViewer();
        }
    }

    var p = GLContext.prototype;

    p.initViewer = function () {
        this.createViewer();
        this.resizeViewer();
        this.appendViewer();
    }

    p.initListeners = function () {
        //window listeners
        w.addEventListener('scroll', this.updateScrollPosition.bind(this));
        w.addEventListener('resize', this.resizeViewer.bind(this));

        //document listeners - mouse and touch events
        document.addEventListener('click', this.onMouseEvent.bind(this), true);
        document.addEventListener('mousemove', this.onMouseEvent.bind(this), true);
        document.addEventListener('mouseup', this.onMouseEvent.bind(this), true);
        document.addEventListener('mousedown', this.onMouseEvent.bind(this), true);
        document.addEventListener('touchstart', this.onMouseEvent.bind(this));
        document.addEventListener('touchend', this.onMouseEvent.bind(this));
    }

    p.updateScrollPosition = function () {
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
        w.HTMLGL.scrollX = scrollOffset.left;
        w.HTMLGL.scrollY = scrollOffset.top;

        this.stage.changed = true;
    }

    p.createViewer = function () {
        w.HTMLGL.renderer = this.renderer = PIXI.autoDetectRenderer(0, 0, {transparent: true});
        this.renderer.view.style.position = 'fixed';
        this.renderer.view.style.top = '0px';
        this.renderer.view.style.left = '0px';
        this.renderer.view.style['pointer-events'] = 'none';
        this.renderer.view.style['pointerEvents'] = 'none';
    }

    p.appendViewer = function () {
        document.body.appendChild(this.renderer.view);
        requestAnimFrame(this.redrawStage.bind(this));
    }

    p.resizeViewer = function () {
        var width = w.innerWidth,
            height = w.innerHeight;

        this.renderer.resize(width, height);
        this.updateTextures();
        this.stage.changed = true;
    }

    p.createStage = function () {
        w.HTMLGL.stage = this.stage = new PIXI.Stage(0xFFFFFF);
        w.HTMLGL.document = this.document = new PIXI.DisplayObjectContainer();
        this.stage.addChild(w.HTMLGL.document);
    }

    p.redrawStage = function () {
        requestAnimFrame(this.redrawStage.bind(this));

        if (this.stage.changed) {
            this.renderer.render(this.stage);
            w.HTMLGL.stage.changed = false;
        }
    }

    p.updateTextures = function () {
        w.HTMLGL.elements.forEach(function(element){
            element.updateTexture();
        });
    }

    p.onMouseEvent = function (event) {
        var x = event.x || event.pageX,
            y = event.y || event.pageY,
            //Finding element under mouse position
            element = event.dispatcher !== 'html-gl' ? this.elementResolver.getElementByCoordinates(x, y) : null;

        //Emit event if there is an element under mouse position
        element ? w.HTMLGL.util.emitEvent(element, event) : null;
    }

    //We would like to rerender if something changed, otherwise stand by
    p.markStageAsChanged = function () {
        if (w.HTMLGL.stage && !w.HTMLGL.stage.changed) {
            w.HTMLGL.stage.changed = true;
        }
    }

    w.HTMLGL.GLContext = GLContext;
    new GLContext();
})(window);