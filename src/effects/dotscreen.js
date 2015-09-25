(function (w) {

    var DotScreen = function (element) {
        this.element = element;
        this.filter = new PIXI.filters.DotScreenFilter();
        this.filter.scale = parseInt(this.element.getAttribute('dotScreenScale')) || 1;
        this.filter.angle = parseInt(this.element.getAttribute('dotScreenAngle')) || 1;
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = DotScreen.prototype;

    p.destroy = function () {
        var filterIndex = this.element.sprite.filters.indexOf(this.filter);
        this.element.sprite.filters = this.element.sprite.filters.splice(filterIndex, 1);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.dotscreen = DotScreen;
})(window);