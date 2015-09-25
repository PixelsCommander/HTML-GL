(function (w) {

    var Pixelate = function (element) {
        this.element = element;
        this.filter = new PIXI.filters.PixelateFilter();
        this.filter.size.x = parseInt(this.element.getAttribute('pixelSizeX')) || 2;
        this.filter.size.y = parseInt(this.element.getAttribute('pixelSizeY')) || 2;
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = Pixelate.prototype;

    p.destroy = function () {
        var filterIndex = this.element.sprite.filters.indexOf(this.filter);
        this.element.sprite.filters = this.element.sprite.filters.splice(filterIndex, 1);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.pixelate = Pixelate;
})(window);