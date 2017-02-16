// ==UserScript==
// @name         Generals.io BetterControls
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Better Controls Plugin

// This allows for better keyboard controls
// Requires modified generals-prod.js -- see Readme for more instructions

// begin modified code
window.FIFTY = [16]; // shiftleft
window.FREE = [70]; // qwerty-f key. overrides "PING", seems unimportant
window.TAB = [9]; // qwerty-f key. overrides "PING", seems unimportant
// end modified code

var BetterControls = (function() {
    var running = false;
    var myGameMap = null;

    function nextCity(backwards) {
        // A) if nothing is selected, jump to general
        // B) if currently on a city/general, pick next (in row-major order) city/general
        // C) otherwise, select the nearest city/general to currently selected square

        var myColor = this.props.playerIndex;
        var myGeneral = this.props.generals[myColor];
        var myCities = this.props.cities.filter(idx => this.props.map.tileAt(idx) === myColor);

        myCities.push(myGeneral);
        if (backwards) {
            myCities.sort((a,b) => b-a); // sort backwards.
        } else {
            myCities.sort((a,b) => a-b); // for some reason this isn't the default behavior of sort()
        }
        myCities.push(myCities[0]); // for convenience (avoiding % arith)

        var cur = this.state.selectedIndex;
        var res = myGeneral;
        if (cur !== -1) {
            if (myCities.indexOf(cur) !== -1) {
                res = myCities[myCities.indexOf(cur) + 1];
            } // todo: implement the jumping to nearest tower thing?
        }
        this.setState({selectedIndex: res, selectedIs50: false});
    }

    function onKeyUp(e) {
        if (FIFTY.indexOf(e.keyCode) !== -1) {
            this.setState({selectedIs50: false});
            return;
        }
    }

    function onKeyDown(e) {
        // begin modified code
        if (e.metaKey) return; // allow command-r to refresh, etc
        if (FIFTY.indexOf(e.keyCode) !== -1) {
            this.setState({selectedIs50: true});
            return;
        }
        // end modified code
        var t = "enable" == f.old_movement;
        if (this.state.inPingMode)
            return void this.disablePingMode();
        if (m("ZOOMIN").indexOf(e.keyCode) !== -1)
            return void (this.state.zoom > g && this.setState({
                zoom: this.state.zoom - 1
            }));
        if (m("ZOOMOUT").indexOf(e.keyCode) !== -1)
            return void (this.state.zoom < T && this.setState({
                zoom: this.state.zoom + 1
            }));
        // begin modified code
        if (TAB.indexOf(e.keyCode) !== -1) {
            nextCity.bind(this)(e.shiftKey);
            return;
        }
        // end modified code
        if (this.props.isReplay)
            return void (m("AUTOPLAY").indexOf(e.keyCode) !== -1 ? this.props.toggleAutoPlay() : m("RIGHT").indexOf(e.keyCode) !== -1 ? c.nextReplayTurn() : m("LEFT").indexOf(e.keyCode) !== -1 && c.backReplay());
        if (e.preventDefault(),
        e.stopPropagation(),
        !this.props.isReplay && m("PING").indexOf(e.keyCode) !== -1) {
            if (!d.hasDuplicate(this.props.teams))
                return;
            return void this.enablePingMode()
        }
        if (m("UNDO").indexOf(e.keyCode) !== -1)
            return void this.undoQueuedAttack();
        if (m("CLEAR").indexOf(e.keyCode) !== -1)
            return void this.clearQueuedAttacks();
        if (m("DESELECT").indexOf(e.keyCode) !== -1)
            return void this.setState({
                selectedIndex: -1
            });
        if (m("CHAT").indexOf(e.keyCode) !== -1)
            return void this.props.focusChat(!1);
        if (m("TEAMCHAT").indexOf(e.keyCode) !== -1)
            return void this.props.focusChat(!0);
        if (!(this.state.selectedIndex < 0)) {
            var n = Math.floor(this.state.selectedIndex / this.props.map.width)
              , r = this.state.selectedIndex % this.props.map.width
              , o = 0
              , i = 0;
            if (m("LEFT").indexOf(e.keyCode) !== -1)
                i = -1;
            else if (m("UP").indexOf(e.keyCode) !== -1)
                o = -1;
            else if (m("RIGHT").indexOf(e.keyCode) !== -1)
                i = 1;
            else {
                if (m("DOWN").indexOf(e.keyCode) === -1)
                    return;
                o = 1
            }
            var a = n + o
              , s = r + i
              , p = this.props.map.tileAt(this.props.map.indexFrom(a, s));
            p !== l.TILE_MOUNTAIN ? (this.onTileClick(a, s),
            t && (p === this.props.playerIndex || this.props.teams && this.props.teams[p] === this.props.teams[this.props.playerIndex]) && this.onTileClick(a, s),
            u.onWASD && u.onWASD()) : t && this.setState({
                selectedIndex: -1
            })
        }
    }

    function start() {
        if (running) return; // already runnnig
        if (!(window.GameMap && window.GameMap.isMounted())) return; // not running modified code OR map is old
        myGameMap = window.GameMap;

        window.removeEventListener("keydown", myGameMap.onKeyDown);
        myGameMap.onKeyDown = onKeyDown.bind(myGameMap);
        myGameMap.onKeyUp = onKeyUp.bind(myGameMap);
        window.addEventListener("keydown", myGameMap.onKeyDown);
        window.addEventListener("keyup", myGameMap.onKeyUp);
        running = true;
        setInterval(function() {
            if (!myGameMap.isMounted()) {
                stop();
            }
        }, 1000);
    }
    function stop() {
        if (running) {
            running = false;
        }
    }

    var result = {
        name: 'BetterControls',
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
            Generals.addPlugin(BetterControls);
            clearInterval(intvl);
        }
    }, 100);
}());
