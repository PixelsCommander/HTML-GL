import GLElement from '../gl-element/GLElement';
import IGLRenderer from './IGLRenderer';

export interface IGLRendererView {
    document: any;
    renderer: IGLRenderer;
    engineRenderer: any;
    init();
    create();
    append();
    resize();
    initListeners();
    updateScrollPosition();
    createDocument();
    createScene();
    updateTextures();
    updateElementsPositions();
}

export default IGLRendererView;