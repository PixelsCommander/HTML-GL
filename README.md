<img alt="HTML GL" src="http://pixelscommander.com/polygon/htmlgl/figures/logo-blue.png"/>

60 FPS and amazing effects by rendering HTML/CSS in WebGL, framework agnostic
=======================================================================================

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/PixelsCommander/HTML-GL)

HTML GL solves "the slow DOM problem" by creating WebGL representations of DOM elements and hiding actual DOM after. This speeds up HTML animations and apply effects available in OpenGL (as modern 3D games have).

- [Demo](http://pixelscommander.com/polygon/htmlgl/demo/filters.html)
- [Article about HTML GL](http://pixelscommander.com/en/web-applications-performance/render-html-css-in-webgl-to-get-highest-performance-possibl/)

Using HTML GL you still work with HTML/CSS as you are common to, but DOM elements are just facades to their WebGL represenations. These GPU accelerated textures are very effective from resources consuming perspective and are very cheap to transform or animate.

Usage
-----

As Web Component

```html
<html-gl>
    This element`s content is rendered in <h1>WebGL</h1>
    <span style="color: green;">was it easy?</span>
    Feel free to use CSS, images and all you are common to in HTML/CSS world.
</html-gl>
```

As jQuery plugin

```html
    $('.some div').htmlgl();
```

No DOM + WebGL rendering = highest FPS possible for Web platform
-------------------------------------------------------

<img alt="HTML GL flow diagram" src="http://pixelscommander.com/polygon/htmlgl/figures/htmlgl-flow-diagram.png"/>

Demos
-----

- [Filters](http://pixelscommander.com/polygon/htmlgl/demo/filters.html) WebGL is not only about performance. It breaks any HTML/CSS limits in terms of animations and interactivity
- [Basic HTML GL](http://pixelscommander.com/polygon/htmlgl/demo/basic-webgl.html) demo shows how to use HTML GL and animate GL Elements. It also demonstrate that HTML GL handle content change events and repaints element`s WebGL representation
- [Basic DOM](http://pixelscommander.com/polygon/htmlgl/demo/basic-dom.html) this is the same project as previous. The only difference is that htmlgl.js is not included
- [Advanced content HTML GL](http://pixelscommander.com/polygon/htmlgl/demo/advanced-content-webgl.html) slider with nested content rendered via WebGL and animated, ability to drag with mouse horizontaly, click event listeners on boxes
- [Advanced content DOM](http://pixelscommander.com/polygon/htmlgl/demo/advanced-content-dom.html)

How to use?
-----------
Include HTMLGL.js into project. Use tag name ```<html-gl>``` or jQuery plugin ```$(myElement).htmlgl()``` for elements you are going to animate. These elements will be rendered in WebGL and their CSS Transform properties will be mapped to WebGL representation transformations. So DOM node itself will not be animated or displayed in order to avoid resources consuming.
HTML GL is framework agnostic and is easy to inject into existing project which needs performance tweaking.

License
-------
MIT: http://mit-license.org/

Copyright 2015 Denis Radin aka [PixelsCommander](http://pixelscommander.com)
