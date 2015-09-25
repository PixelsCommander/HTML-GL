(function (w) {

    var RGBSplit = function (element) {
        this.element = element;
        this.filter = new PIXI.filters.RGBSplitFilter();
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = RGBSplit.prototype;

    p.destroy = function () {
        var filterIndex = this.element.sprite.filters.indexOf(this.filter);
        this.element.sprite.filters = this.element.sprite.filters.splice(filterIndex, 1);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.rgbsplit = RGBSplit;
})(window);