import {GLContext, getCurrentContext} from '../GLContext';
import {BoundingRect, TransformObject} from '../types';
import GLObserver from './GLObserver';
import * as updaters from './updaters';
import * as helpers from './helpers';
import * as utils from '../utils/';
import GLAttributesProcessor from './GLAttributesProcessor';
import * as ImagesLoaded from '../utils/images-loaded';
import {getGLChildren, getGLParent, isGLNode} from "./helpers";
import {
    GL_ELEMENT_PROPERTY_NAME,
    GL_RENDERER_ATTRIBUTE_NAME,
    GL_RENDERER_ATTRIBUTE_VALUE,
} from "../constants";
import * as debounce from 'debounce-promise';

const debounceTime = 500;

export class GLElement {
    public settings: any = {};
    public context: GLContext;
    public node: HTMLElement;
    public parent: GLElement;
    public observer: GLObserver;
    public displayObject: any;
    public opacity: number;
    public scale: number;
    public ready: boolean = false;
    public boundingRect: BoundingRect = new BoundingRect();
    public transformObject: TransformObject = new TransformObject();
    private isChanged: boolean = false;
    private rasterizing: boolean = false;
    private updaters = updaters;
    private attributesProcessor: GLAttributesProcessor;
    private shader: string;
    private initializationPromise: Promise<void>;

    constructor(node, settings: any) {
        if (!node) throw('HTML node is not specified for GLElement');

        if (isGLNode(node)) {
            throw('The node is already GL rendered');
            return;
        }

        if (!node.isConnected) {
            return;
        }

        this.setNode(node);
        this.context = getCurrentContext();
        this.context.elements.push(this);
        this.observer = new GLObserver(this);
        this.attributesProcessor = new GLAttributesProcessor(this);
        this.displayObject = this.context.renderer.createDisplayObject(this);

        this.initParent();
        this.init();
    }

    init = () => {
        this.initializationPromise = new Promise(resolve => {
            // @ts-ignore
            new ImagesLoaded(this.node).then(() => {
                    //Children should be processed before rendering to know which nodes to igonre when rasterizing
                    var children = utils.getNodeChildren(this.node);
                    children.forEach((child) => {
                        GLElement.processChildren(child, this);
                    });
                }
            )
                .then(() => {
                    return this.updateTexture().then(() => {
                        this.hideDOM(resolve);
                        this.ready = true;
                        if (this.settings.oninitialized && this.settings.oninitialized instanceof Function) {
                            this.settings.oninitialized.apply(this);
                        }
                    });
                });
        })
    }

    addChild(glElement) {
        this.context.renderer.addTo(this, glElement);
    }

    removeChild(glElement) {
        this.context.renderer.removeFrom(this, glElement);
        glElement.dispose();
    }

    setNode(node) {
        this.node = node;
        node[GL_ELEMENT_PROPERTY_NAME] = this;
        node.setAttribute(GL_RENDERER_ATTRIBUTE_NAME, GL_RENDERER_ATTRIBUTE_VALUE);
    }

    hideDOM(callback?: () => void) {
        const glChildren = getGLChildren(this);
        const promises = glChildren.map(child => child.initializationPromise);
        Promise.all(promises).then(() => setTimeout(() => {
            //console.log("Hide", this.node.className);
            this.node.style.opacity = "0";
            if (callback) {
                callback();
            }
        }, debounceTime));
    }

    initParent() {
        this.parent = getGLParent(this.node);
        if (this.parent) {
            this.parent.addChild(this);
        } else {
            this.context.renderer.addTo(null, this);
        }
    }

    markAsChanged() {
        this.isChanged = true;
        requestAnimationFrame(this.syncTransform);
        getCurrentContext().renderer.markStageAsChanged();
    }

    syncTransform = () => {
        if (this.isChanged) {

            //Composing element page coordinates with transforms
            var composedTransform = {
                translateX: this.transformObject.translateX,
                translateY: this.transformObject.translateY,
                translateZ: this.transformObject.translateZ,
                scaleX: this.transformObject.scaleX,
                scaleY: this.transformObject.scaleY,
                scaleZ: this.transformObject.scaleZ,
                rotateX: this.transformObject.rotateX,
                rotateY: this.transformObject.rotateY,
                rotateZ: this.transformObject.rotateZ
            };

            //Updating display object transforms
            this.context.renderer.setTransform(this, composedTransform);

            //Updating opacity
            this.context.renderer.setOpacity(this, this.opacity);

            this.isChanged = false;
        }
    }

    get styleObject() {
        return this.observer.styleObserver.styleObject;
    }

    update(updaterName, styleObject?) {
        if (this.updaters[updaterName]) {
            //console.log('Updating ' + updaterName + ' on ' + this.node.tagName + '-' + (this.node.id + this.node.className));
            return this.updaters[updaterName].apply(this, [styleObject]);
        }
    }

    updateTexture = debounce((): Promise<ImageData | void> => {
        if (!this.rasterizing && !this.ready) {
            //console.log('Updating texture', this.node);
            this.markAsChanged();
            const promise = new Promise(resolve => this.context.rasterizer(this).then(this.onTextureRendered).then(resolve));
            this.rasterizing = true;
            this.update('boundingRect');
            return promise as Promise<ImageData | void>;
        } else {
            return Promise.resolve();
        }
    }, debounceTime)

    onTextureRendered = (imageData?: ImageData) => {
        if (imageData) {
            this.update('updateStyles');
            this.rasterizing = false;
            this.markAsChanged();
            this.context.renderer.setTexture(this, imageData);
            //console.log('Finished rendering', this.node);
        }
    }

    setShader(shaderCode: string) {
        if (!shaderCode || !shaderCode.length) {
            this.shader = null;
            this.ready && this.context.renderer.setShader(this, null);
        } else {
            this.shader = shaderCode;
            this.ready && this.context.renderer.setShader(this, shaderCode);
        }
    }

    static processChildren(node, rootGLElement) {
        if (!utils.isHTMLNode(node)) {
            return;
        }

        var createdElement = false;

        //Iterate and create glNodes if should be created
        if (helpers.shouldBeGLNode(node)) {
            if (!helpers.isGLNode(node)) {
                new GLElement(node, rootGLElement.settings);
                createdElement = true;
            } else {
                node.GLElement.update('boundingRect');
                node.GLElement.update('transform');
            }
        }

        if (!createdElement && (node.children.length > 0 || node.tagName === 'IFRAME')) {

            var children = utils.getNodeChildren(node);
            children.forEach((child) => {
                GLElement.processChildren(child, rootGLElement);
            });
        }
    }

    dispose() {
        this.node = null;
        this.parent = null;
        this.context = null;
        this.displayObject = null;
        this.observer.dispose();
    }
}

class GLHTMLElement extends HTMLElement {
    static get observedAttributes() {
        return ['shader'];
    }

    connectedCallback() {
        this.style.display = "inline-block";
        new GLElement(this, {
            heavyDiff: false,
        });
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        if (this[GL_ELEMENT_PROPERTY_NAME] && this[GL_ELEMENT_PROPERTY_NAME].attributesProcessor) {
            this[GL_ELEMENT_PROPERTY_NAME].attributesProcessor.process(attributeName, newValue);
        }
    }
}

// @ts-ignore
customElements.define('html-gl', GLHTMLElement);

export default GLElement;
