// ==UserScript==
// @name         Generals.io Plugin Manager
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  toolbox for generals.io
// @author       Steven Hao
// @match        http://generals.io/*
// @grant        none
// ==/UserScript==


// ==================================
// Some language stuff / utils
function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
}

Array.prototype.flatMap = function(fn) {
    return this.map(fn).reduce((sum, add) => sum.concat(add));
};

String.prototype.contains = function(needle) {
    return this.indexOf(needle) != -1;
};

Array.prototype.contains = function(needle) {
    return this.indexOf(needle) != -1;
};

Array.prototype.remove = function(needle) {
    this.splice(this.indexOf(needle), 1);
};

// ==================================
// Interfacing with the DOM

function getCells() {
    var map = document.getElementById('map');
    var rows = map.childNodes[0].childNodes;
    return toArray(rows).flatMap(row => toArray(row.childNodes));
}

// ==================================
// Persistent settings using browser storage
var Settings = (function() {
  function get(key) {
    return localStorage.getItem(key);
  }

  function set(key, val) {
    localStorage.setItem(key, val);
  }

  return {
    get: get,
    set: set,
  };
}());

var SettingNames = {
  autorun: function(plugin) {
    return 'autorun-' + plugin.name;
  },
};


// ==================================
// Putting it all together in a dashboard

// This allows us to write plugins in a modular way.
// Other scripts that depend on the above language utils should also depend on this plugin manager.
// Check that the manager is loaded: if (Generals && Generals.ready()) { ... }

var Generals = (function() {
    var mounted = false;
    var plugins = []; // the dashboard doubles as a plugin manager
    var dashboard = document.createElement('div');
    dashboard.style.cssText = 'z-index: 11; position: absolute; right: 20px; bottom: 30px; width: 200px; height: 300px; outline: 5px solid #252525; text-align: center;';
    dashboard.innerHTML = '<p>#swog</p>';

    // only call this when Generals && Generals.ready() is true.
    function addPlugin(plugin) {
        var button = document.createElement('button');
        button.style.cssText = 'font-size: 14px; padding: 2px 4px';
        button.innerHTML = plugin.name;
        button.onclick = function() {
            if (plugin.running()) {
                plugin.stop();
            } else {
                plugin.start();
            }
        };

        // redraw the button's background every second
        setInterval(function() {
            button.style.backgroundColor = plugin.running() ? 'black' : 'white';
        }, 1000);

        // draw checkbox for autorun setting
        var autorunSetting = SettingNames.autorun(plugin);
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Settings.get(autorunSetting) === 'on';
        checkbox.onchange = function() {
          Settings.set(autorunSetting, checkbox.checked ? 'on' : 'off');
        };

        // autorun the plugin
        setInterval(function() {
          if (Settings.get(autorunSetting) === 'on') {
            if (!plugin.running()) {
              plugin.start();
            }
          }
        }, 1000);

        dashboard.appendChild(button);
        dashboard.appendChild(checkbox);
    }

    function mount() {
        if (mounted) return;

        document.body.appendChild(dashboard);
        mounted = true;
    }

    return {
        mount: mount,
        ready: function() {
            return mounted;
        },
        addPlugin: addPlugin,
    };
}());

window.getCells = getCells; // add convenience methods to the global namespace
window.Generals = Generals; // export generals


// Mount it when document is loaded
// avoid window.onload in case some other script uses it (is this necessary?)

(function() {
    var intvl = setInterval(function() {
        if (document.readyState === "complete") {
            Generals.mount();
            clearInterval(intvl);
            console.log('mounted.');
        }
    }, 100);
}());
