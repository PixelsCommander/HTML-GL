(function (w) {

    var Pixelate = function (element) {
        this.element = element;
        this.filter = new PIXI.filters.PixelateFilter();
        this.filter.size.x = parseInt(this.element.getAttribute('pixelSizeX')) || 5;
        this.filter.size.y = parseInt(this.element.getAttribute('pixelSizeY')) || 5;
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = Pixelate.prototype;

    p.destroy = function () {
        //this.element.sprite.removeFilter([this.filter]);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.pixelate = Pixelate;
})(window);