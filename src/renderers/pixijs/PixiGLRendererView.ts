import * as PIXI from 'pixi.js';
import * as utils from '../../utils';
import { getCurrentContext } from '../../GLContext';
import { IGLRenderer } from '../IGLRenderer';
import { IGLRendererView } from '../IGLRendererView';
import { Vec2 } from '../../types';

export class PixiGLRendererView implements IGLRendererView {

    public node: HTMLElement;
    public camera: any;
    public scene: any;
    public document: any;
    public renderer: IGLRenderer;
    public engineRenderer: any;

    constructor(renderer) {
        this.renderer = renderer;
        this.createDocument();

        // @ts-ignore
        utils.waitForDocumentLoaded()
            .then(this.init.bind(this));
    }

    init() {
        this.create();
        this.resize();
        this.append();
        this.createScene();
        this.initListeners();

        this.node = this.engineRenderer.view;
    }

    create() {
        var pixelRatio = getCurrentContext().getPixelRatio(),
            width = window.innerWidth * pixelRatio,
            height = window.innerHeight * pixelRatio;

        this.engineRenderer = PIXI.autoDetectRenderer(width, height, {transparent: true});
        this.engineRenderer.view.style.position = 'fixed';
        this.engineRenderer.view.style.top = '0px';
        this.engineRenderer.view.style.left = '0px';
        this.engineRenderer.view.style['pointer-events'] = 'none';
        this.engineRenderer.view.style['pointerEvents'] = 'none';
    }

    append() {
        document.body.appendChild(this.engineRenderer.view);
        //requestAnimationFrame(this.redrawStage.bind(this));
    }

    resize() {
        console.log('Resized');
        var self = this,
            pixelRatio = getCurrentContext().getPixelRatio(),
            width = window.innerWidth * pixelRatio,
            height = window.innerHeight * pixelRatio;

        var rendererScale = 1 / pixelRatio;
        this.engineRenderer.view.style.transformOrigin = '0 0';
        this.engineRenderer.view.style.webkitTransformOrigin = '0 0';
        this.engineRenderer.view.style.transform = 'scaleX(' + rendererScale + ') scaleY(' + rendererScale + ')';
        this.engineRenderer.view.style.webkitTransform = 'scaleX(' + rendererScale + ') scaleY(' + rendererScale + ')';
        this.engineRenderer.resize(width, height);

        if (this.engineRenderer.view.parentNode) { //No need to update textures when is not mounted yet
            this.updateTextures();
        }

        this.updateElementsPositions();
        //this.renderer.markStageAsChanged();
    }

    initListeners() {
        //window listeners
        document.addEventListener('scroll', this.updateScrollPosition.bind(this));
        window.addEventListener('resize', utils.debounce(this.resize, 500, false).bind(this));
        window.addEventListener('resize', this.updateElementsPositions.bind(this));
    }

    updateScrollPosition() {
        let scrollOffset: Vec2 = {
            x: 0,
            y: 0,
        };
        const pixelRatio = getCurrentContext().getPixelRatio();

        if (window.pageYOffset != undefined) {
            scrollOffset = {
                x: pageXOffset,
                y: pageYOffset
            };
        } else {
            var sx, sy, d = document, r = d.documentElement, b = d.body;
            sx = r.scrollLeft || b.scrollLeft || 0;
            sy = r.scrollTop || b.scrollTop || 0;
            scrollOffset = {
                x: sx,
                y: sy
            };
        }

        getCurrentContext().document.x = -scrollOffset.x * getCurrentContext().getPixelRatio();
        getCurrentContext().document.y = -scrollOffset.y * getCurrentContext().getPixelRatio();

        getCurrentContext().scrollX = scrollOffset.x;
        getCurrentContext().scrollY = scrollOffset.y;

        //this.markStageAsChanged();
    }

    createDocument() {
        getCurrentContext().document = this.document = new PIXI.Container();
        this.updateScrollPosition();
    }

    createScene() {
        this.scene = new PIXI.Container();
        this.scene.addChild(getCurrentContext().document);
        this.renderer.registerScene(this.scene, this.camera);
    }

    updateTextures() {
        var updatePromises = [];

        getCurrentContext().elements.forEach(function (element) {
            setTimeout(() => {
                element.update('boundingRect');
                updatePromises.push(element.updateTexture());
            }, 0);
        });

        return Promise.all(updatePromises);
    }

    updateElementsPositions() {
        getCurrentContext().elements.forEach(function (element) {
            element.update('boundingRect');
            //element.updatePivot();
            element.update('transform');
        });
    }
}

export default PixiGLRendererView;