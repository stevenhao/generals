// ==UserScript==
// @name         Generals.io DvorakControls
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Use the "wasd"-position keys, actually ",aoe" on dvorak, to navigate

// Useful for dvorak typists!

var DvorakControls = (function() {
    var running = false;
    function start() {
      if (!(window.GameMap && window.GameMap.isMounted())) return;
      myGameMap = window.GameMap;

      m("UP").push(188);
      m("LEFT").push(65); // actually, this is unnecessary, as the letter "a" coincides on dvorak/qwerty
      // we include this line for completeness' sake
      m("DOWN").push(79);
      m("RIGHT").push(69);

      // the e key is already reserved for UNDO
      // replace that UNDO with "."
      m("UNDO").splice(m("UNDO").indexOf(69), 1);
      m("UNDO").push(190);
      // assign ; to clear
      m("CLEAR").push(186);

      setInterval(function() {
        if (!myGameMap.isMounted()) {
            stop();
        }
      }, 1000);
      running = true;
    }
    function stop() {

      // reassign E to undo
      m("UNDO").push(69);
      m("RIGHT").splice(m("RIGHT").indexOf(69), 1);
      // don't bother removing other controls as they don't get in the way of anything

      if (running) {
          running = false;
      }
    }
    var result = {
        name: 'DvorakControls',
        running: function() {
            return running;
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
            Generals.addPlugin(DvorakControls);
            clearInterval(intvl);
        }
    }, 100);
}());

