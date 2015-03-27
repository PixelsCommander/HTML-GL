window.changeNodeContent = function () {
    document.getElementsByTagName('html-gl')[0].innerHTML = '<h4>WOW!</h4> <p class="justified-text">innerHTML changed and element was rerendered <span class="orange-text">automaticaly</span>. Sorry, retina is not supported yet, so a bit blurry.</p>';
}

window.changeNodeTransform = function () {
    var element = document.getElementsByTagName('html-gl')[0];
    element.style.webkitTransform = 'translateX(400px) translateY(100px)';
    element.style.transform = 'translateX(400px) translateY(100px)';
}

window.animateBasic = function () {
    var element = document.getElementsByTagName('html-gl')[0];

    var v = Velocity(element, {
        translateX: 100,
        translateY: 100,
        scaleX: 4,
        scaleY: 4,
        rotateZ: "360deg"
    }, {duration: 1000}).then(function () {
        Velocity(element, {
            translateX: 0,
            translateY: 0,
            scaleX: 1,
            scaleY: 1,
            rotateZ: "0"
        }, {duration: 1000});
    });
}