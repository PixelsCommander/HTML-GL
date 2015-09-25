(function (w) {

    var DiagonalBlur = function (element) {
        this.element = element;
        this.filter = new PIXI.filters.BlurDirFilter(2, 2);
        this.filter.passes = 2;
        this.filter.blur = 3;
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = DiagonalBlur.prototype;

    p.destroy = function () {
        var filterIndex = this.element.sprite.filters.indexOf(this.filter);
        this.element.sprite.filters = this.element.sprite.filters.splice(filterIndex, 1);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.diagonalblur = DiagonalBlur;
})(window);