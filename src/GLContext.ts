
import GLElement from './gl-element/GLElement';
import IGLRenderer from './renderers/IGLRenderer';
import GLInteractionController from './GLInteractionController';
import {waitForDocumentLoaded} from './utils/index';

export function getCurrentContext(): GLContext {
    return (<any>window).HTMLGL;
}

export class GLContext {

    public enabled = true;
    public elements: Array<GLElement> = [];
    public renderer: IGLRenderer;
    public rasterizer: (GLElement) => Promise<any>;
    public scene: any;
    public document: any;
    public camera: any;
    public isChanged: boolean = false;
    private shouldCreateStage = true;
    private interactionController: GLInteractionController = null;

    public scrollX = 0;
    public scrollY = 0;

    constructor(renderer, rasterizer, shouldCreateStage) {
        (<any>window).HTMLGL = this;

        this.shouldCreateStage = shouldCreateStage;

        this.renderer = new renderer();
        this.rasterizer = rasterizer;

        // @ts-ignore
        waitForDocumentLoaded()
            .then(this.initInteraction.bind(this));
    }

    initInteraction() {
        this.interactionController = new GLInteractionController(document.body);
    }

    getPixelRatio() {
        return (<any>window).devicePixelRatio || 1;
    }

    createElement(node, settings) {
        return new GLElement(node, settings);
    }
}

export default GLContext;
