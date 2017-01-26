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

    var watchIntvl = 0;
    var watchMessagesIntvl = 0;

    function start() {
        if (watchIntvl) {
            return;
        }

        try {
            var lb = document.getElementById('game-leaderboard');

            lb.rows[0].insertCell(2).innerHTML = '&Delta;';
            for (var i = 1; i < lb.rows.length; ++i) {
                lb.rows[i].insertCell(2);
            }
            var army = [];
            var army_index;
            var player_index = 0; // in case of minimized leaderboard
            for (i = 0; i < lb.rows[0].cells.length; ++i) {
                if (lb.rows[0].cells[i].innerText == 'Player') {
                    player_index = i;
                }
                if (lb.rows[0].cells[i].innerText == 'Army') {
                    army_index = i;
                }
            }
            for (i = 1; i < lb.rows.length; ++i) {
                var name= lb.rows[i].cells[player_index].className;
                army[name] = parseInt(lb.rows[i].cells[army_index].innerText);
            }
            console.log('watching leaderboard...');
        } catch (ex) {
            return;
        }

        var curTurn = getTurn();

        watchIntvl = setInterval(function() {
            try {
                var delta_index = 2;
                var army_index;
                var player_index = 0; // in case of minimized leaderboard
                var lb = document.getElementById('game-leaderboard');
                for (i = 0; i < lb.rows[0].cells.length; ++i) {
                    if (lb.rows[0].cells[i].innerHTML == "Δ") {
                        delta_index = i;
                    } else if (lb.rows[0].cells[i].innerText == 'Army') {
                        army_index = i;
                    } else if (lb.rows[0].cells[i].innerText == 'Player') {
                        player_index = i;
                    }
                }
                console.log('delta idx', delta_index);
                if (getTurn() != curTurn) {
                    for (var i = 1; i < lb.rows.length; ++i) {
                        var name= lb.rows[i].cells[player_index].className;
                        var new_army = parseInt(lb.rows[i].cells[army_index].innerText);
                        var delta = new_army - army[name];
                        var cell = lb.rows[i].cells[delta_index];
                        if (delta > 0) {
                            cell.style.backgroundColor = 'yellowgreen';
                        }
                        else if (delta < -40) {
                            cell.style.backgroundColor = 'red';
                        }
                        else {
                            cell.style.backgroundColor = 'pink';
                        }
                        cell.innerText = delta;
                        army[name] = new_army;
                    }
                    curTurn = getTurn();
                }
            } catch(ex) {
                throw ex;
                stop();
            }
        }, 250);
    }

    function stop() {
        if (watchIntvl) {
            var lb = document.getElementById('game-leaderboard');
            if (lb) {
                Array.from(lb.rows).forEach(row => row.deleteCell(2));
            }
            clearInterval(watchIntvl);
            watchIntvl = 0;
            console.log('no longer watching leaderboard.');
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
