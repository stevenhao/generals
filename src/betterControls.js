// ==UserScript==
// @name         Generals.io BetterControls
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==

// ==================================
// Better Controls Plugin

// This allows for better keyboard controls
// Requires modified generals-prod.js -- see Readme for more instructions

var BetterControls = (function() {
    var running = false;
    var myGameMap = null;

    var FIFTY = [16]; // shiftleft
    function onKeyDown(e, t) {
        if (h.ZOOMIN.indexOf(e.keyCode) !== -1)
            return void (this.state.zoom > d && this.setState({
                zoom: this.state.zoom - 1
            }));
        if (h.ZOOMOUT.indexOf(e.keyCode) !== -1)
            return void (this.state.zoom < v && this.setState({
                zoom: this.state.zoom + 1
            }));
        if (this.props.isReplay)
            return void (h.AUTOPLAY.indexOf(e.keyCode) !== -1 ? this.props.toggleAutoPlay() : h.RIGHT.indexOf(e.keyCode) !== -1 ? l.nextReplayTurn() : h.LEFT.indexOf(e.keyCode) !== -1 && l.backReplay());
        if (e.preventDefault(),
            e.stopPropagation(),
            h.UNDO.indexOf(e.keyCode) !== -1)
            return void this.undoQueuedAttack();
        if (h.CLEAR.indexOf(e.keyCode) !== -1)
            return void this.clearQueuedAttacks();
        if (h.DESELECT.indexOf(e.keyCode) !== -1)
            return void this.setState({
                selectedIndex: -1
            });
        if (h.CHAT.indexOf(e.keyCode) !== -1)
            return void this.props.focusChat();
        if (!(this.state.selectedIndex < 0)) {
            var t = Math.floor(this.state.selectedIndex / this.props.map.width)
                , n = this.state.selectedIndex % this.props.map.width
                , r = 0
                , o = 0;
            if (FIFTY.indexOf(e.keyCode) !== -1) {
                this.setState({selectedIs50: !this.state.selectedIs50});
            }
            if (h.LEFT.indexOf(e.keyCode) !== -1)
                o = -1;
            else if (h.UP.indexOf(e.keyCode) !== -1)
                r = -1;
            else if (h.RIGHT.indexOf(e.keyCode) !== -1)
                o = 1;
            else {
                if (h.DOWN.indexOf(e.keyCode) === -1)
                    return;
                r = 1
            }
            var i = t + r
                , a = n + o
                , s = this.props.map.tileAt(this.props.map.indexFrom(i, a));
            s !== u.TILE_MOUNTAIN ? (this.onTileClick(i, a),
                // previously, there was another onTileClick(i, a) call.. this is no longer necessary as our onTileClick will auto-select (i,a)
                c.onWASD && c.onWASD()) : this.setState({
                    //begin modified code
                    //selectedIndex: -1,
                    // end modified code
                })
        }
    }

    function onTileClick(e, t) {
        console.log('onTileClick');
        var n = this.props.map;
        if (!(e < 0 || t < 0 || e >= n.height || t >= n.width)) {
            var r = n.indexFrom(e, t);
            if (this.state.selectedIndex < 0)
                this.setState({
                    selectedIndex: n.indexFrom(e, t),
                    selectedIs50: !1
                });
            else if (this.state.selectedIndex === r)
                this.state.selectedIs50 ? this.setState({
                    selectedIndex: -1
                }) : this.setState({
                    selectedIs50: !0
                });
            else {
                // begin modified code
                var curColor = this.props.map.tileAt(this.state.selectedIndex);
                var canMove = (curColor === this.props.playerIndex ||
                    (curColor !== -1 && this.props.teams &&
                    this.props.teams[s] === this.props.teams[curColor]));
                // end modified code
                var o = {
                    selectedIndex: -1
                };
                //begin modified code
                o.selectedIndex = r;
                o.selectedIs50 = !1;
                //end modified code
                if (canMove && n.isAdjacent(r, this.state.selectedIndex)) {
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
                if (!n.isAdjacent(r, this.state.selectedIndex) || canMove) {
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

        window.removeEventListener("keydown", myGameMap.onKeyDown)
        myGameMap.onKeyDown = onKeyDown.bind(myGameMap);
        window.addEventListener("keydown", myGameMap.onKeyDown)
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
