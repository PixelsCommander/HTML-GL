import * as domToImage from 'dom-to-image';

export function rasterize(glElement) {
    return new Promise(resolve => {
        const startTime = Date.now();
        domToImage.draw(glElement.node, {
            width: glElement.boundingRect.width,
            height: glElement.boundingRect.height,
            style: {
                transform: null,
                opacity: 1,
                //display: 'block'
            },
            filter: node => {
                /*if (node.tagName === 'HTML-GL') {
                    node.style.visibility = 'hidden';
                }
                setTimeout(() => node.style.visibility = 'visible', 0);*/
                return true;
            }
        }).then(texture => {
            const endTime = Date.now();
            const interval = endTime - startTime;
            console.log(`Rendering ${glElement.node.id} took ${interval}`);
            resolve(texture);
        });
    })
}
