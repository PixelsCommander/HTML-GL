import { rasterize } from './rasterizers/domToImageRasterizer';
//import { rasterize } from './rasterizers/htmlToCanvasRasterizer';
import ThreeGLRenderer from './renderers/threejs/ThreeGLRenderer';
import GLContext from './GLContext';

new GLContext(ThreeGLRenderer, rasterize, true);
