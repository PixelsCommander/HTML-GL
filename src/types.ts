export type Rasterizer = (any) => Promise<any>;

export type Vec2 = {
    x: number,
    y: number,
}

export class BoundingRect {
    public left = 0;
    public right: number = 0;
    public top: number = 0;
    public bottom: number = 0;
    public width: number = 0;
    public height: number = 0;
}

export class TransformObject {
    public rotateX: number = 0;
    public rotateY: number = 0;
    public rotateZ: number = 0;
    public translateX: number = 0;
    public translateY: number = 0;
    public translateZ: number = 0;
    public scaleX: number = 0;
    public scaleY: number = 0;
    public scaleZ: number = 0;
};