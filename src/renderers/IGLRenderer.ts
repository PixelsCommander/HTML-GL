import GLElement from '../gl-element/GLElement';

export interface IGLRenderer {
    sprites: Array<any>;
    view: any;
    scene: any;
    camera: any;
    createDisplayObject(glElement: GLElement);
    setTexture(glElement: GLElement, imageData: ImageData);
    setTransform(glElement: GLElement, transformObject: any);
    setOpacity(glElement: GLElement, opacityValue: number);
    setShader(glElement: GLElement, shaderCode: string);
    updateUniform(glElement: GLElement, uniformName: string, uniformValue: number);
    addTo(parentGLElement: GLElement, glElement: GLElement);
    removeFrom(parentGLElement: GLElement, glElement: GLElement);
    nodesAtPoint(x: number, y: number);
    onMouseMove(glElement: GLElement, x: number, y: number);
    onMouseDown(glElement: GLElement, x: number, y: number);
    onMouseUp(glElement: GLElement, x: number, y: number);
    onMouseClick(glElement: GLElement, x: number, y: number);
    registerScene(sceneArg: any, cameraArg: any);
    redrawLoop();
    redrawStage();
    markStageAsChanged();
}

export default IGLRenderer;
