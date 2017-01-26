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
    var freeMoving = false; // should we reselect squares without attacking?

    function nextCity() {
        // A) if nothing is selected, jump to general
        // B) if currently on a city/general, pick next (in row-major order) city/general
        // C) otherwise, select the nearest city/general to currently selected square

        var myColor = this.props.playerIndex;
        var myGeneral = this.props.generals[myColor];
        var myCities = this.props.cities.filter(idx => this.props.map.tileAt(idx) === myColor);

        myCities.push(myGeneral);
        myCities.sort((a,b) => a-b); // sort by numerical value. for some reason default is base10-lex
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
    function toggleFreeMoving() {
        freeMoving = !freeMoving;
        document.body.className = freeMoving ? 'freeMoving' : '';
    }

    function addFreemovingStyle() {
        var style = document.createElement('style');
        style.innerHTML = '.freeMoving #map td.selected { opacity: .50; }';
        document.body.appendChild(style);
    }
    addFreemovingStyle();

    function onKeyDown(e) {
        // begin modified code
        if (e.metaKey) return; // allow command-r to refresh, etc
        if (FIFTY.indexOf(e.keyCode) !== -1) {
            this.setState({selectedIs50: !this.state.selectedIs50});
            return;
        }
        console.log(e.keyCode);
        if (FREE.indexOf(e.keyCode) !== -1) {
            toggleFreeMoving();
            return;
        }
        // end modified code
        if (this.state.inPingMode) return void this.disablePingMode();
        if (m("ZOOMIN").indexOf(e.keyCode) !== -1) return void(this.state.zoom > y && this.setState({
            zoom: this.state.zoom - 1
        }));
        if (m("ZOOMOUT").indexOf(e.keyCode) !== -1) return void(this.state.zoom < T && this.setState({
            zoom: this.state.zoom + 1
        }));
        if (this.props.isReplay) return void(m("AUTOPLAY").indexOf(e.keyCode) !== -1 ? this.props.toggleAutoPlay() : m("RIGHT").indexOf(e.keyCode) !== -1 ? l.nextReplayTurn() : m("LEFT").indexOf(e.keyCode) !== -1 && l.backReplay());
        if (e.preventDefault(), e.stopPropagation(), m("PING").indexOf(e.keyCode) !== -1) {
            if (!d.hasDuplicate(this.props.teams)) return;
            return void this.enablePingMode()
        }
        if (TAB.indexOf(e.keyCode) !== -1) {
            nextCity.bind(this)();
            return;
        }
        if (m("UNDO").indexOf(e.keyCode) !== -1) return void this.undoQueuedAttack();
        if (m("CLEAR").indexOf(e.keyCode) !== -1) return void this.clearQueuedAttacks();
        if (m("DESELECT").indexOf(e.keyCode) !== -1) return void this.setState({
            selectedIndex: -1
        });
        if (m("CHAT").indexOf(e.keyCode) !== -1) return void this.props.focusChat(!1);
        if (m("TEAMCHAT").indexOf(e.keyCode) !== -1) return void this.props.focusChat(!0);
        if (!(this.state.selectedIndex < 0)) {
            var t = Math.floor(this.state.selectedIndex / this.props.map.width),
                n = this.state.selectedIndex % this.props.map.width,
                r = 0,
                o = 0;
            if (m("LEFT").indexOf(e.keyCode) !== -1) o = -1;
            else if (m("UP").indexOf(e.keyCode) !== -1) r = -1;
            else if (m("RIGHT").indexOf(e.keyCode) !== -1) o = 1;
            else {
                if (m("DOWN").indexOf(e.keyCode) === -1) return;
                r = 1
            }
            var i = t + r,
                a = n + o,
                s = this.props.map.tileAt(this.props.map.indexFrom(i, a));
          (s !== c.TILE_MOUNTAIN
            // begin modified code
            || freeMoving)
            // end modified code
            ? (this.onTileClick(i, a), (s === this.props.playerIndex || this.props.teams && this.props.teams[s] === this.props.teams[this.props.playerIndex])
            // begin modified code
            // && this.onTileClick(i, a),
            // end modified code
            ,u.onWASD && u.onWASD()) : this.setState({
                // begin modified code
                // selectedIndex: -1
                // end modified code
            })
        }
    }

    function onTileClick(e, t) {
        var n = this.props.map;
        if (!(e < 0 || t < 0 || e >= n.height || t >= n.width)) {
            var r = n.indexFrom(e, t);
            if (this.state.inPingMode) this.pingTile(r), this.disablePingMode();
            else if (this.state.selectedIndex < 0) this.setState({
                selectedIndex: n.indexFrom(e, t),
                selectedIs50: !1
            });
            else if (this.state.selectedIndex === r) this.state.selectedIs50 ? this.setState({
                selectedIndex: -1
            }) : this.setState({
                selectedIs50: !0
            });
            else {
                // begin modified code
                var curColor = this.props.map.tileAt(this.state.selectedIndex);
                var canMove = (curColor === this.props.playerIndex ||
                    (curColor !== -1 && this.props.teams &&
                    this.props.teams[this.props.playerIndex] === this.props.teams[curColor]));
                var enoughArmy = this.props.map.armyAt(this.state.selectedIndex) >= 2 || this.state.queuedAttacks.length > 0;
                // end modified code
                var o = {
                    selectedIndex: -1
                };
                // begin modified code
                o.selectedIndex = r;
                o.selectedIs50 = !1;
                // end modified code
                if (n.isAdjacent(r, this.state.selectedIndex) && r !== this.state.selectedIndex
                // begin modified code
                && enoughArmy && canMove && !freeMoving
                // end modified code
                ) {
                    var i = this.state.selectedIndex;
                    s.attack(i, r, this.state.selectedIs50, this.state.attackIndex);
                    Object.assign(o, {
                        queuedAttacks: this.state.queuedAttacks.concat([{
                            attackIndex: this.state.attackIndex,
                            begin: i,
                            end: r
                        }]),
                        attackIndex: this.state.attackIndex + 1
                    })
                }
                // begin modified code
                // only set state when jumping or successfully moving
                // do NOT set state when attempting to queue a move when you don't own selectedIndex yet
                if (!n.isAdjacent(r, this.state.selectedIndex) || canMove || freeMoving) {
                    this.setState(o)
                }
                //this.setState(o)
                // end modified code
            }
        }
    }

    function start() {
        if (running) return; // already runnnig
        if (!(window.GameMap && window.GameMap.isMounted())) return; // not running modified code OR map is old
        myGameMap = window.GameMap;

        window.removeEventListener("keydown", myGameMap.onKeyDown);
        myGameMap.onKeyDown = onKeyDown.bind(myGameMap);
        window.addEventListener("keydown", myGameMap.onKeyDown);
        myGameMap.onTileClick = onTileClick;
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
