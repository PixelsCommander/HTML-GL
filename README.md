<img alt="HTML GL" src="http://pixelscommander.com/polygon/htmlgl/figures/logo-green.png"/>

Render HTML/CSS via WebGL, framework agnostic
=====================================================================

60 FPS animations and responsive interactions are top priority problems of cross-platform Web development. Since desktop browsers are mostly fine with handling animations, mobile and embedded devices still provide bad user experience.
The biggest reason for animations to be janky is that "DOM is slow". It is true since DOM is quite complex model and every DOM change create a ripple of events or chain reaction over whole document.

HTML GL solves "the slow DOM problem" by creating WebGL representations of DOM elements and hiding actual DOM after. As a result you still work with HTML/CSS as you common to, but DOM elements are just facades to their WebGL represenations. These GPU accelerated textures are very effective from resources consuming perspective and are very cheap to transform or animate.

No DOM + WebGL rendering = highest FPS possible for Web platform
-------------------------------------------------------

<img alt="HTML GL flow diagram" src="http://pixelscommander.com/polygon/htmlgl/figures/htmlgl-flow-diagram.png"/>

Demos
-----

- [Basic demo](http://pixelscommander.com/polygon/htmlgl/demo/basic-webgl.html) basic demo shows how to use HTML GL and animate GL Elements. It also demonstrate that HTML GL handle content change events and repaints element`s WebGL representation
- [HTML GL](http://pixelscommander.com/polygon/htmlgl/demo/advanced-content-webgl.html) slider rendered via WebGL
- [DOM](http://pixelscommander.com/polygon/htmlgl/demo/advanced-content-dom.html) this is the same project. The only difference is that HTMLGL.js is not included

How to use?
-----------
Use tag name ```<html-gl>``` on elements you are going to animate. These elements will be rendered in WebGL also their CSS Transform properties will be mapped to WebGL representation transformations. So DOM element itself will not be animated or displayed in order to avoid resources consuming.
HTML GL is framework agnostic and is easy to inject into existing project which needs performance tweaking.

License
-------
MIT: http://mit-license.org/

Copyright 2015 Denis Radin aka [PixelsCommander](http://pixelscommander.com)
