(function (w) {

    var Twist = function (element) {
        this.element = element;
        this.filter = new PIXI.filters.TwistFilter();
        this.filter.radius = parseInt(this.element.getAttribute('twistRadius')) || 0.5;
        this.filter.angle = parseInt(this.element.getAttribute('twistAngle')) || 5;
        this.element.sprite.filters = (this.element.sprite.filters || []).concat(this.filter);
    }

    var p = Twist.prototype;

    p.destroy = function () {
        var filterIndex = this.element.sprite.filters.indexOf(this.filter);
        this.element.sprite.filters = this.element.sprite.filters.splice(filterIndex, 1);
    }

    w.HTMLGL.effects = w.HTMLGL.effects || {};
    w.HTMLGL.effects.twist = Twist;
})(window);