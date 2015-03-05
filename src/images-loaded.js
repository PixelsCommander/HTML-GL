(function (w) {
    var ImagesLoaded = function (element, callback) {
        this.element = element;
        this.images = this.element.querySelectorAll('img');
        this.callback = callback;
        this.imagesLoaded = this.getImagesLoaded();

        if (this.images.length === this.imagesLoaded) {
            this.onImageLoaded();
        } else {
            this.addListeners();
        }
    }

    var p = ImagesLoaded.prototype;

    p.getImagesLoaded = function () {
        var result = 0;
        for (var i = 0; i < this.images.length; i++) {
            if (this.images[i].complete === true) {
                result++;
            }
        }
        return result;
    }

    p.addListeners = function () {
        var result = 0;
        for (var i = 0; i < this.images.length; i++) {
            if (this.images[i].complete !== true) {
                this.images[i].addEventListener('load', this.onImageLoaded.bind(this));
                this.images[i].addEventListener('error', this.onImageLoaded.bind(this));
            }
        }
        return result;
    }

    p.onImageLoaded = function () {
        this.imagesLoaded++;
        if (this.images.length - this.imagesLoaded <= 0) {
            setTimeout(this.callback, 0);
        }
    }

    w.HTMLGL.ImagesLoaded = ImagesLoaded;
})(window);