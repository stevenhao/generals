// ==UserScript==
// @name         Generals.io AutoForceStart
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Automatically force start in games

// Hit the force start button if it exists && isn't already pressed
// Useful when testing (saves time)

var ForceStart = (function() {
    var intvl = 0;
    function start() {
        if (intvl) return;
        var btn = document.querySelector('.center button');
        if (btn && btn.textContent.indexOf('Force Start') !== -1) {
            intvl = setInterval(function() {
                var btn = document.querySelector('.center button');
                if (btn && btn.className.indexOf('inverted') === -1) {
                    btn.click();
                } else {
                    stop(); // we good
                }
            }, 100);
        }
    }
    function stop() {
        if (!intvl) return;
        clearInterval(intvl);
        intvl = 0;
    }
    var result = {
        name: 'SpamForceStart',
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
            Generals.addPlugin(ForceStart);
            clearInterval(intvl);
        }
    }, 100);
}());

