HTML GL - get as many FPS as you want by rendering your app in WebGL
====================================================================

60 FPS animations and responsive interaction is a top priprity problem of cross-platform Web development. Since desktop browsers are mostly fine with managing animations, mobile and embedded devices still provide bad user experience.
The biggest reason for animations to be janky is that "DOM is slow". It is true since DOM is quite complex model and every change of DOM create a ripple of events or chain reaction over whole document.

HTML GL solves the problem of slow DOM by creating WebGL representations of DOM nodes and hiding actual DOM after. WebGL elements representations are very effective from resources consuming perspective since they are GPU accelerated textures which are very easy to transform and paint.

Avoiding DOM + WebGL rendering = maximum FPS possible for Web platform.

[Basic demo](http://pixelscommander.com/polygon/htmlgl/demo/) basic demo shows how to use HTML GL and animate GL Elements. It also demonstrate that HTML GL handle content change events and repaints element`s WebGL representation.
[HTML GL](http://pixelscommander.com/polygon/htmlgl/demo/webgl.html) slider rendered via WebGL
[DOM](http://pixelscommander.com/polygon/htmlgl/demo/dom.html) this is the same project. The only difference is that HTMLGL.js is not included.

How to use?
-----------
Use tag name ```<webgl>``` on elements you are going to animate. These divs and their content will be rendered in WebGL also their CSS Transform properties maped to WebGL representation transformations. So DOM elements will not take part in animations which is resource saving.
HTML GL is framework agnostic and it is easy to apply HTML GL to existing project in order to tweek performance.

License
-------
MIT: http://mit-license.org/

Copyright 2014 Denis Radin aka [PixelsCommander](http://pixelscommander.com)

Inspired by Christopher Chedeau`s [react-xtags](http://github.com/vjeux/react-xtags/)