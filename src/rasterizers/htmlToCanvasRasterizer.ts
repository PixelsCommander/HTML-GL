import  html2canvas from 'html2canvas';

export function rasterize(glElement) {
    return new Promise(resolve => {
        const startTime = Date.now();
        // @ts-ignore
        html2canvas(glElement.node, {
            width: glElement.boundingRect.width,
            height: glElement.boundingRect.height,
            backgroundColor: null,
            onclone: (document, element) => {
                Array.from(document.querySelectorAll('html-gl')).forEach((node: HTMLElement) => node.style.visibility = 'hidden');
                glElement.node.style.visibility = 'visible';
            }
        }).then(texture => {
            const endTime = Date.now();
            const interval = endTime - startTime;
            console.log(`Rendering ${glElement.node.id} took ${interval}`);
            resolve(texture);
        });
    })
}
