HTML GL - get as many FPS as you want by rendering your app in WebGL
====================================================================

60 FPS animations and responsive interaction is a top priprity problem of cross-platform Web development. Since desktop browsers are fine with managing animations, mobile and embedded devices still stuck sometimes providing bad user experience.
HTML GL solves the problem by creating WebGL representations of DOM nodes which are lightweight in terms of animation. At the same time it hides actual DOM nodes and avoids their animations. However HTML nodes are still in the tree and affect layout which is useful debugging application state with DevTools.

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