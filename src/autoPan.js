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
    var intvl = 0;
    var MAX_SPEED = 4;
    function parse(str) {
        return parseInt(str.substring(0, str.length - 2));
    }
    function start() {
        var cells = getCells();
        if (cells.length) {
          intvl = setInterval(function() {
              var cur = document.querySelector('.selected');
              var container = document.querySelector('.relative');
              var page = document.querySelector('#game-page');
              if (cur) {
                  var left = cur.offsetLeft,
                      top = cur.offsetTop,
                      width = cur.offsetWidth,
                      height = cur.offsetHeight;
                  var cleft = parse(container.style.left);
                  var ctop = parse(container.style.top);
                  var totalWidth = page.offsetWidth;
                  var totalHeight = page.offsetWidth;

                  var radx = Math.min(3, Math.max(1, Math.floor((totalWidth / width - 1) / 2)));
                  var rady = Math.min(3, Math.max(1, Math.floor((totalHeight / height - 1) / 2)));
                  var x = cleft + left; var x_l = width*radx, x_r = totalWidth - width * (radx + 1);
                  var y = ctop + top; var y_l = height*rady, y_r = totalHeight - height * (rady + 1);

                  if (x < x_l - 1) {
                      container.style.left = (cleft + Math.min(x_l-x, MAX_SPEED)) + 'px';
                  } else if (x > x_r + 1) {
                      container.style.left = (cleft - Math.min(x-x_r, MAX_SPEED)) + 'px';
                  }

                  if (y < y_l - 1) {
                      container.style.top = (ctop + Math.min(y_l-y, MAX_SPEED)) + 'px';
                  } else if (y > y_r + 1) {
                      container.style.top = (ctop - Math.min(y-y_r, MAX_SPEED)) + 'px';
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

