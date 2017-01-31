// ==UserScript==
// @name         Generals.io LeaderboardWatcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Tony Jiang
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Leaderboard Watcher Plugin

// This augments the leaderboard to display how much army players are gaining
// or losing.

var LeaderboardWatcher = (function() {

    function getTurn() {
        return document.getElementById('turn-counter').innerText.split(' ')[1];
    }

    function getTitles() {
        var lb = document.getElementById('game-leaderboard');
        return Array.from(lb.rows[0].children).map(x => x.innerHTML);
    }

    function isMinimized() {
        var titles = getTitles();
        return titles[0] === ' ';
    }

    function removeDeltaColumn() {
        var lb = document.getElementById('game-leaderboard');
        if (!lb) return;
        var titles = getTitles();
        var deltaIdx = titles.indexOf("Δ");
        if (deltaIdx == -1) return;
        Array.from(lb.rows)
            .forEach(row => row.deleteCell(deltaIdx));
    }

    function addDeltaColumn() {
        var lb = document.getElementById('game-leaderboard');
        var titles = getTitles();
        var deltaIdx = titles.indexOf("Δ");
        if (deltaIdx !== -1) return;

        deltaIdx = isMinimized() ? 1 : 2;
        var titleCell = lb.rows[0].insertCell(deltaIdx);
        titleCell.innerHTML = '&Delta;';
        titleCell.clasSName = 'delta';

        Array.from(lb.rows).slice(1)
            .forEach(x => x.insertCell(deltaIdx));
    }

    function getArmies() {
        var lb = document.getElementById('game-leaderboard');
        var titles = getTitles();
        var armyIdx = titles.indexOf("Army");
        var nameIdx = isMinimized() ? 0 : 1;
        if (armyIdx === -1 || nameIdx === -1) {
            throw new Exception('cannot find army title', titles);
        }

        var nums = Array.from(lb.rows).slice(1)
            .map(x => parseInt(x.children[armyIdx].textContent));
        var names = Array.from(lb.rows).slice(1)
            .map(x => x.children[nameIdx].className);
        var armies = {};
        nums.forEach((num, idx) => {
            armies[names[idx]] = num;
        });
        return armies;
    }

    var watchIntvl = 0;
    var watchMessagesIntvl = 0;

    function start() {
        if (watchIntvl) {
            return;
        }
        var lb = document.getElementById('game-leaderboard');
        if (!lb) return; // cannot start yet

        var turn = '';
        var armies = {};
        watchIntvl = setInterval(function() {
            try {
                if (getTurn() === turn) {
                    return;
                }
                turn = getTurn();
                var newArmies = getArmies();

                addDeltaColumn();

                lb = document.getElementById('game-leaderboard');
                var titles = getTitles();
                var deltaIdx = titles.indexOf("Δ");
                var nameIdx = isMinimized() ? 0 : 1;
                Array.from(lb.rows).slice(1)
                    .forEach(row => {
                        var name = row.children[nameIdx].className;
                        var delta = newArmies[name] - (armies[name] || 0);
                        var cell = row.children[deltaIdx];
                        cell.style.backgroundColor = (delta > 0) ?
                            'yellowgreen' :
                            (delta <= -30) ?
                            'red' :
                            'pink';
                        cell.innerHTML = delta;
                    });
                armies = newArmies;
            } catch(ex) {
                stop();
            }
        }, 250);
    }

    function stop() {
        if (watchIntvl) {
            removeDeltaColumn();
            clearInterval(watchIntvl);
            watchIntvl = 0;
        }
    }

    var result = {
        name: 'LeaderboardWatcher',
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
            Generals.addPlugin(LeaderboardWatcher);
            clearInterval(intvl);
        }
    }, 100);
}());
