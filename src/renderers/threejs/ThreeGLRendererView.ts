import * as THREE from 'three';
import * as utils from '../../utils';
import {getCurrentContext} from '../../GLContext';
import {IGLRenderer} from '../IGLRenderer';
import {IGLRendererView} from '../IGLRendererView';
import {Vec2} from '../../types';
import {debounce} from "debounce";

class ThreeGLRendererView implements IGLRendererView {

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

        this.node = this.engineRenderer.domElement;
    }

    create() {
        var pixelRatio = getCurrentContext().getPixelRatio(),
            width = window.innerWidth * pixelRatio,
            height = window.innerHeight * pixelRatio;

        this.engineRenderer = new THREE.WebGLRenderer({alpha: true});
        this.engineRenderer.setClearColor(0x000000, 0);

        this.engineRenderer.domElement.style.position = 'fixed';
        this.engineRenderer.domElement.style.top = '0px';
        this.engineRenderer.domElement.style.left = '0px';
        this.engineRenderer.domElement.style['pointer-events'] = 'none';
        this.engineRenderer.domElement.style['pointerEvents'] = 'none';
    }

    append() {
        document.body.appendChild(this.engineRenderer.domElement);
    }

    resize = (event?) => {
        console.log('Resized');
        var self = this,
            pixelRatio = getCurrentContext().getPixelRatio(),
            width = window.innerWidth * pixelRatio,
            height = window.innerHeight * pixelRatio;

        var rendererScale = 1 / pixelRatio;
        this.engineRenderer.domElement.style.transformOrigin = '0 0';
        this.engineRenderer.domElement.style.webkitTransformOrigin = '0 0';
        this.engineRenderer.domElement.style.transform = 'scaleX(' + rendererScale + ') scaleY(' + rendererScale + ')';
        this.engineRenderer.domElement.style.webkitTransform = 'scaleX(' + rendererScale + ') scaleY(' + rendererScale + ')';

        this.camera.left = 0;
        this.camera.right = width / pixelRatio;
        this.camera.top = 0;
        this.camera.bottom = -height / pixelRatio;
        this.camera.updateProjectionMatrix();

        this.engineRenderer.setSize(width, height);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        //If comes from event listener and has parent
        if (event && this.engineRenderer.domElement.parentNode) {
            this.updateTextures();
        }

        this.updateElementsPositions();
        this.renderer.markStageAsChanged();
    }

    initListeners() {
        document.addEventListener('scroll', this.updateScrollPosition.bind(this));
        window.addEventListener('resize', debounce(this.resize, 500));
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

        this.camera.position.x = -scrollOffset.x;
        this.camera.position.y = -scrollOffset.y;

        getCurrentContext().scrollX = scrollOffset.x;
        getCurrentContext().scrollY = scrollOffset.y;

        this.renderer.markStageAsChanged();
    }

    createDocument() {
        var pixelRatio = getCurrentContext().getPixelRatio(),
            width = window.innerWidth * pixelRatio,
            height = window.innerHeight * pixelRatio;

        getCurrentContext().document = this.document = new THREE.Object3D();
        getCurrentContext().camera = this.camera = new THREE.OrthographicCamera(0, width / pixelRatio, 0, -height / pixelRatio, 1, 10000);
        this.camera.position.z = 100;
    }

    createScene() {
        // Is here for compatibility reasons with PIXI renderer
        (<any>window).scene = getCurrentContext().scene = this.scene = new THREE.Scene();
        this.scene.add(this.document);
        var ambientLight = new THREE.AmbientLight(0xffffff);
        this.document.add(ambientLight);
        this.renderer.registerScene(this.scene, this.camera);
        this.updateScrollPosition();
    }

    updateTextures() {
        var updatePromises = [];

        getCurrentContext().elements.forEach(function (element) {
            setTimeout(() => {
                updatePromises.push(element.updateTexture());
            }, 0);
        });

        return Promise.all(updatePromises);
    }

    updateElementsPositions() {
        getCurrentContext().elements.forEach(function (element) {
            if (element.ready) {
                element.update('boundingRect');
                //element.updatePivot();
                element.update('transform');
            }
        });
    }
}

export default ThreeGLRendererView;
