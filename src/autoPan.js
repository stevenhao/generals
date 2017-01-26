// ==UserScript==
// @name         Generals.io AutoPan
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Track the selected square
// Lazily adjust the map-pan (but not the zoom) so that you can always see a radius of 2 around the currently selected square
// Irrelevant when the whole map is in view
// does not require experimental features

var AutoPan = (function() {
    var MARGIN = 10;
    var MAX_COMFORTABLE = 10;
    var MIN_COMFORTABLE = 3;
    var intvl = 0;
    var MAX_SPEED = 4;
    function parse(str) {
        return parseInt(str.substring(0, str.length - 2));
    }

    function radius(total, size) {
        var upperBound = Math.floor((total / size - 1) / 2);
        var comfortable = Math.floor((total / size - 1) / 3);
        comfortable = Math.min(MAX_COMFORTABLE, Math.max(MIN_COMFORTABLE, comfortable));
        var result = Math.min(comfortable, Math.max(1, upperBound));
        return result;
    }

    function start() {
        var cells = getCells();
        if (cells.length) {
            intvl = setInterval(function() {
                var cur = document.querySelector('.selected');
                var container = document.querySelector('.relative');
                var map = document.querySelector('#map');
                if (cur) {
                    var left = cur.offsetLeft,
                        top = cur.offsetTop,
                        width = cur.offsetWidth,
                        height = cur.offsetHeight;
                    var cleft = parse(container.style.left);
                    var ctop = parse(container.style.top);
                    var containerWidth = container.offsetWidth;
                    var containerHeight = container.offsetHeight;
                    var totalWidth = document.body.offsetWidth;
                    var totalHeight = document.body.offsetHeight;

                    var mapWidth = map.offsetWidth;
                    var mapHeight = map.offsetHeight;

                    var radx = radius(totalWidth, width);
                    var rady = radius(totalHeight, height);
                    var x = cleft + left; var x_l = width*radx, x_r = totalWidth - width * (radx + 1);
                    var y = ctop + top; var y_l = height*rady, y_r = totalHeight - height * (rady + 1);
                    // x is position of the top-left corner of selected square on the game page

                    if (x < x_l - 1) { // then it is too much to the left. we should move the container to the right a bit.
                        var desired = Math.min(MARGIN, (cleft + Math.min(x_l-x, MAX_SPEED)));
                        if (desired > cleft) {
                            container.style.left = desired + 'px';
                        }
                    } else if (x > x_r + 1) { // then it is too much to right
                        var desired = Math.max(totalWidth - mapWidth-MARGIN, cleft - Math.min(x-x_r, MAX_SPEED));
                        if (desired < cleft) {
                            container.style.left = desired + 'px';
                        }
                    }

                    if (y < y_l - 1) {
                        var desired = Math.min(MARGIN, ctop + Math.min(y_l-y, MAX_SPEED));
                        if (desired > ctop) {
                            container.style.top = desired + 'px';
                        }
                    } else if (y > y_r + 1) {
                        var desired = Math.max(totalHeight - mapHeight - MARGIN, ctop - Math.min(y - y_r, MAX_SPEED));
                        if (desired < ctop) { // only allow movements up (decreasing ctop)
                            container.style.top = desired + 'px';
                        }
                    }
                }
            }, 20);
        }

    }
    function stop() {
        clearInterval(intvl);
        intvl = 0;
    }
    var result = {
        name: 'AutoPan',
        running: function() {
            return intvl !== 0;
        },
        start: start,
        stop: stop,
    };
    return result;
}());

// add to the plugin manager
(function() {
    var intvl = setInterval(function() {
        if (Generals && Generals.ready()) {
            Generals.addPlugin(AutoPan);
            clearInterval(intvl);
        }
    }, 100);
}());

