import * as html2canvas from 'html2canvas';

export function rasterize(glElement) {
    return new Promise(resolve => {
        const startTime = Date.now();
        // @ts-ignore
        html2canvas(glElement.node, {
            width: glElement.boundingRect.width,
            height: glElement.boundingRect.height,
            backgroundColor: null,
        }).then(texture => {
            const endTime = Date.now();
            const interval = endTime - startTime;
            console.log(`Rendering ${glElement.node.id} took ${interval}`);
            resolve(texture);
        });
    })
}
