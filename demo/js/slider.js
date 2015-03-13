//Slider logic, written in HTML / JS.
//The only difference between HTML GL and basic HTML is that you should use element.styleGL.transform instead of element.style.transform

var images = document.getElementsByTagName('img'),
    dragStart = false,
    slider = document.getElementsByTagName('html-gl')[0],
    startX = 0,
    startLeft = 0,
    transformPropertyName = document.body.style.transform !== undefined ? 'transform' : 'WebkitTransform';

for (var i = 0; i < images.length; i++) {
    images[i].ondragstart = function () {
        return false;
    };
}


function onDragStart(event) {
    dragStart = true;
    startX = (event.pageX || event.x) || event.touches[0].pageX;
    startLeft = parseInt(parseCSSTransform((slider.styleGL || slider.style)[transformPropertyName]).translateX) || 0;
}

function onDragEnd() {
    dragStart = false;
}

function onMove(event) {
    if (dragStart) {
        var pageX = (event.pageX || event.x) || event.touches[0].pageX;
        (slider.styleGL || slider.style)[transformPropertyName] = 'translateZ(0) translateX(' + (startLeft - (startX - (pageX || 0))) + 'px)';
    }
}

slider.addEventListener('mousedown', onDragStart);
slider.addEventListener('mouseup', onDragEnd);
slider.addEventListener('mousemove', onMove);
slider.addEventListener('touchstart', onDragStart);
slider.addEventListener('touchend', onDragEnd);
slider.addEventListener('touchmove', onMove);

parseCSSTransform = function (transformString) {
    return (transformString.match(/([\w]+)\(([^\)]+)\)/g) || [])
        //make pairs of prop and value
        .map(function (it) {
            return it.replace(/\)$/, "").split(/\(/)
        })
        //convert to key-value map/object
        .reduce(function (m, it) {
            return m[it[0]] = it[1], m
        }, {});
}

window.addEventListener('load', function () {
    setTimeout(function () {
        Velocity(document.getElementsByTagName('html-gl')[0], {translateX: 408}, {duration: 500});
    }, 500);
});