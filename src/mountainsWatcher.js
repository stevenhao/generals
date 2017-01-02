// ==UserScript==
// @name         Generals.io MountainsWatcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Mountains Watcher Plugin

// This watches for changes in "obstacles", and highlights them.
// When a general is captured, it changes from "fog" to "obstacle fog" on the map.
// This allows us to figure out where the dead generals were, and more easily guess where the remaining generals are.

var MountainsWatcher = (function() {
    function getCityCells() {
        var cells = getCells();
        var result = [];
        cells.forEach((cell, idx) => {
            if (cell.className.contains('city')     ||
                cell.className.contains('mountain') ||
                cell.className.contains('obstacle')) {
                result.push(idx);
            }
        });
        return result;
    }

    function markCell(cell) {
        cell.style.outline = '3px dashed white';
    }

    var watchIntvl = 0;

    function start() {
        if (watchIntvl) {
             stop();
        }

        try {
            var initialMountains = getCityCells();
            console.log('initial mountains: ', initialMountains);
            console.log('watching mountains...');
        } catch (ex) {
            console.log('failed to start');
            return;
        }

        watchIntvl = setInterval(function() {
            try {
                var currentMountains = getCityCells();
                var newMountains = currentMountains.filter(idx => !initialMountains.contains(idx));
                var cells = getCells();
                //        console.log('new mountains:', newMountains);
                newMountains.map(idx => cells[idx]).forEach(markCell);
            } catch(ex) {
                stop();
            }
        }, 500);
    }

    function stop() {
        clearInterval(watchIntvl);
        watchIntvl = 0;
        console.log('no longer watching mountains.');
    }

    var result = {
        name: 'MountainsWatcher',
        running: function() {
            return watchIntvl !== 0;
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
            Generals.addPlugin(MountainsWatcher);
            clearInterval(intvl);
        }
    }, 100);
}());
