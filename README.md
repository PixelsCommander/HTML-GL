<img alt="HTML GL" src="http://pixelscommander.com/polygon/htmlgl/figures/logo-blue.png"/>

60 FPS and amazing effects by rendering HTML/CSS in WebGL, framework agnostic
=======================================================================================

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/PixelsCommander/HTML-GL)

HTML GL makes it easy to render some of page elements with WebGL. This allows to apply pixel shaders to HTML elements and provides some performance tweaking opportunitites.

- [Demo](http://pixelscommander.com/polygon/htmlgl/demo/filters.html)
- [Project page](http://htmlgl.com)
- [Theory behind HTML GL](http://pixelscommander.com/en/web-applications-performance/render-html-css-in-webgl-to-get-highest-performance-possibl/)

Using HTML GL you still work with HTML/CSS as you are used to, but DOM elements are just facades to their WebGL represenations. These GPU accelerated textures are very effective from resources consuming perspective and are very cheap to transform or animate.

Install
-------
npm:
```
npm i --save html-gl
```

yarn:
```
yarn add html-gl
```

Usage
-----

```html
<html-gl>
    This element`s content is rendered in <h1>WebGL</h1>
    <span style="color: green;">was it easy?</span>
    Feel free to use CSS, images and all you are common to in HTML/CSS world.
</html-gl>
```

Applying shaders from Shadertoy.com
-----

You simply set `shader` attribute. This is 

```html
<html-gl shader="Shader code copied from shadertoy.com">
    ...content to apply shader to
</html-gl>
```

No DOM + WebGL rendering = highest FPS possible for Web platform
-------------------------------------------------------

<img alt="HTML GL flow diagram" src="http://pixelscommander.com/polygon/htmlgl/figures/htmlgl-flow-diagram.png"/>

Demos
-----

- [Dynamic lightning](http://pixelscommander.com/polygon/htmlgl/demo/ripples.html) use attribute `effects` on `<html-gl>` element to specify effects you use, this one is nice for mobile
- [Onhover shader](http://pixelscommander.com/polygon/htmlgl/demo/filters.html) WebGL is not only about performance. It breaks any HTML/CSS limits in terms of animations and interactivity
- [Shader from Shadertoy](http://pixelscommander.com/polygon/htmlgl/demo/basic-webgl.html) demo shows how to use HTML GL and animate GL Elements. It also demonstrate that HTML GL handle content change events and repaints element`s WebGL representation
- [Mouse interaction](http://pixelscommander.com/polygon/htmlgl/demo/advanced-content-dom.html)

How to use?
-----------
Include HTMLGL.js into project. Use tag name `<html-gl>` for elements you are going to animate. These elements will be rendered in WebGL and their CSS Transform properties will be mapped to WebGL representation transformations. So DOM node itself will not be animated or displayed in order to avoid resources consuming.
HTML GL is framework agnostic and is easy to inject into existing project which needs performance tweaking.

Rasterization API
-----------------
There is an opportunity to improve the technollogy significantly if we have Rasterization API in browsers. Check it out and promote if like the idea [proposal draft](https://gist.github.com/PixelsCommander/a0b5882139cbb8a1781c#file-proposal-md) you may like to read [article](http://pixelscommander.com/en/javascript/state-of-html-content-rasterization-draw-html-to-canvas-image/) about the need for such an API.

Fast way to animate
-------------------
The most performant way to animate HTML-GL tags is to operate on tag's `styleGL.transform` in the same way you operate on `style.transform`. E.g. `style.transform = 'translateX(100px) translateY(50px)'`.
Velocity.js copy from HTML-GL repository (https://github.com/PixelsCommander/HTML-GL/blob/master/demo/js/vendor/velocity.js) have this optimization built-in. Feel free to use it in the way described in official Velocity.js documentation.

Animating HTML-GL tag children
------------------------------
Since it is very efficient to make transformations (move, rotate, scale, change opacity) on HTML-GL tags it becomes very slow to animate it's children until they are HTML-GL tags too. This happens because of necessity to rasterize and send HTML-GL tag texture to GPU.

License
-------
MIT: http://mit-license.org/

Copyright 2021 Denis Radin aka [PixelsCommander](http://pixelscommander.com)
