(function (w) {

    var Pixelate = function (element) {
        this.element = element;
        this.filter = new PIXI.PixelateFilter();
        this.filter.size.x = parseInt(this.element.getAttribute('pixelSizeX'));
        this.filter.size.y = parseInt(this.element.getAttribute('pixelSizeY'));
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = Pixelate.prototype;

    p.destroy = function () {
        //this.element.sprite.removeFilter([this.filter]);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.pixelate = Pixelate;
})(window);