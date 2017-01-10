// make a simple bot that moves back and forth on the general

console.log('autoPlay.js is loaded');
var reloaded = false;
var map, armies;

function reload() {
    if (!window.GameMap) return;
    reloaded = true;
    map = GameMap.props.map._map;
    armies = GameMap.props.map._armies;
}

function getHeight() {
    return GameMap.props.map.height;
}

function getWidth() {
    return GameMap.props.map.width;
}


function inbounds(sq) {
    return 0 <= sq && sq < getWidth() * getHeight();
}
function neighbors(sq) {
    return [sq - 1, sq + 1, sq - getWidth(), sq + getWidth()].filter(inbounds);
}

function rand(n) {
    return Math.floor(Math.random() * n);
}
function notMountain(indx) {
    return map[indx] != n.TILE_MOUNTAIN;
}
function notTower(indx) {
    return GameMap.props.cities.indexOf(indx) === -1;
}

function getMap() {
    return GameMap.props.map._map;
}

function getArmy() {
    return GameMap.props.map._armies;
}

function getOurSquares() {
    var result = [];
    getMap().forEach((color, idx) => {
        if (color === GameMap.props.playerIndex) {
            result.push(idx);
        }
    });
    return result;
}

function getGeneral() {
    var cells = getCells();
    var result = null;
    cells.forEach((cell, idx) => {
        if (cell.className.contains('general')) {
            result = idx;
        }
    });
    return result;
}

function moveObj(fromIdx, toIdx) {
    this.from = from;
    this.to = toIdx;
};


function noStupid(move) {
    
}

function atLeast2Army(idx) {
    return getArmy()[idx] >= 2;
}

function attack(sq1, sq2) {
    console.log('attack(' + sq1 + ',' + sq2+')');
    s.attack(sq1, sq2, false, 0);
}

function autoPlayStep() {
    if (!window.GameMap) {
        console.log('need window.GameMap');
        return;
    }
    var cands = getOurSquares().filter(atLeast2Army);
    var startLoc = cands[rand(cands.length)];
    var nbrs = neighbors(startLoc);
    var canAttack = nbrs.filter(notTower).filter(notMountain);
    attack(startLoc, nbrs[rand(nbrs.length)]);
}
window.autoPlayStep = autoPlayStep;


function autoPlay() {
    if (!window.GameMap) {
        console.log('need window.GameMap');
        return;
    }
    setInterval(autoPlayStep, 1000);
}

window.autoPlay = autoPlay;

var intvl = setInterval(() => {
    reload();
    if (reloaded)
        clearInterval(intvl);
}, 100);
