HTML GL - get as many FPS as you want by rendering your app in WebGL
====================================================================

60 FPS animations and responsive interaction is a top priprity problem of cross-platform Web development. Since desktop browsers are mostly fine with managing animations, mobile and embedded devices still provide bad user experience.
The biggest reason for animations to be janky is that "DOM is slow". It is true since DOM is quite complex model and every change of DOM create a ripple of events or chain reaction over whole document.

HTML GL solves the slow DOM problem by making snapshots of DOM elements, creating their WebGL representations based on these snapshots and hiding actual DOM after. As a result DOM elements become simple facades to their WebGL represenations (GPU accelerated textures) which are very effective from resources consuming perspective and are very cheap to transform or animate.

No DOM + WebGL GPU rendering = highest FPS possible for Web platform
-------------------------------------------------------

<img alt="HTML GL flow diagram" src="http://pixelscommander.com/polygon/htmlgl/htmlgl-flow-diagram.png"/>

Demos
-----

- [Basic demo](http://pixelscommander.com/polygon/htmlgl/demo/) basic demo shows how to use HTML GL and animate GL Elements. It also demonstrate that HTML GL handle content change events and repaints element`s WebGL representation
- [HTML GL](http://pixelscommander.com/polygon/htmlgl/demo/webgl.html) slider rendered via WebGL
- [DOM](http://pixelscommander.com/polygon/htmlgl/demo/dom.html) this is the same project. The only difference is that HTMLGL.js is not included

How to use?
-----------
Use tag name ```<webgl>``` on elements you are going to animate. These divs and their content will be rendered in WebGL also their CSS Transform properties maped to WebGL representation transformations. So DOM elements will not take part in animations which is resource saving.
HTML GL is framework agnostic and it is easy to apply HTML GL to existing project in order to tweek performance.

License
-------
MIT: http://mit-license.org/

Copyright 2015 Denis Radin aka [PixelsCommander](http://pixelscommander.com)