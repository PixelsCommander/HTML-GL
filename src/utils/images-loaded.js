/*
 * ImagesLoaded is a part of HTML GL library which is a robust solution for determining "are images loaded or not?"
 * Copyright (c) 2016 http://pixelscommander.com
 * Distributed under MIT license
 * http://htmlgl.com
 *
 * Please, take into account:
 * - updateTexture is expensive
 * - updateTransform is cheap
 */


var ImagesLoaded = function (element) {

    return new Promise((resolve, reject) => {

        this.resolve = resolve;
        this.element = element;
        this.images = this.element.parentNode.querySelectorAll('img, iframe');

        this.onImageLoaded = this.onImageLoaded.bind(this);

        this.imagesLoaded = this.getImagesLoaded();

        if (this.images.length === this.imagesLoaded) {
            this.onImageLoaded();
        } else {
            this.addListeners();
        }
    });
}

var p = ImagesLoaded.prototype;

p.getImagesLoaded = function () {
    var result = 0;
    for (var i = 0; i < this.images.length; i++) {
        if (this.images[i].complete === true || this.images[i].contentWindow) {
            result++;
        }
    }
    return result;
}

p.addListeners = function () {
    var result = 0;
    for (var i = 0; i < this.images.length; i++) {
        if (this.images[i].complete !== true && !this.images[i].contentWindow) {
            this.images[i].onload = this.onImageLoaded;
            this.images[i].addEventListener('load', this.onImageLoaded);
            this.images[i].addEventListener('error', this.onImageLoaded);
        }
    }
    return result;
}

p.onImageLoaded = function () {
    this.imagesLoaded++;
    if (this.images.length - this.imagesLoaded <= 0) {
        setTimeout(this.resolve, 1);
    }
}

module.exports = ImagesLoaded;