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

    var colors = {};
    
    function markCellWhite(cell) {
        cell.style.outline = '3px dashed white';
    }
    
    function markCell(cell) {
        cell.style.outline = '3px dashed ' + getCapturedColor();
    }
    
    function getCapturedColor() {
        var messages = document.getElementsByClassName('server-chat-message');
        // iterate backwards through messages, find first message that matches "A" captured "B."
        var re = /(.+)\scaptured\s(.+)\./;
        for (var i = messages.length - 1; i >= 0; i--) {
            var matches = re.exec(messages[i].innerHTML);
            if (matches && colors.hasOwnProperty(matches[1])) {
                return colors[matches[1]];
            }
        }

        // something went wrong, default to white
        return 'white';
    }

    var watchIntvl = 0;

    function start() {
        if (watchIntvl) {
             stop();
        }

        try {
            var initialMountains = getCityCells();
            
            // get player colors
            var lb = document.getElementsByClassName('leaderboard-name');
            for (var i = 0; i < lb.length; i++) {
                var player = lb[i].innerHTML;
                var classes = lb[i].className.split(/[ ]+/);
                colors[player] = classes[classes.length - 1];
            }
            
            console.log('initial mountains: ', initialMountains);
            console.log('watching mountains...');
        } catch (ex) {
            console.log('failed to start');
            return;
        }
        
        var deadGenerals = [];

        watchIntvl = setInterval(function() {
            try {
                var currentMountains = getCityCells();
                var newMountains = currentMountains.filter(idx => !initialMountains.contains(idx));
                
                // only mark new dead locations
                var newDeadGenerals = newMountains.filter(idx => !deadGenerals.contains(idx))
                for (var i = 0; i < newMountains.length; i++) {
                    deadGenerals.push(newDeadGenerals[i]);
                }
                
                var cells = getCells();
                //        console.log('new mountains:', newMountains);
                
                // if more than one general is captured, it is ambiguous and we mark those cells white
                if (newDeadGenerals.length > 1) {
                    newDeadGenerals.map(idx => cells[idx]).forEach(markCellWhite);
                } else {
                    newDeadGenerals.map(idx => cells[idx]).forEach(markCell);
                }
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
