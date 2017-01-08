# generals

A collection of scripts for the game [www.generals.io](generals.io).

## Setup with TamperMonkey

[http://tampermonkey.net/](TamperMonkey) is a Chrome Extension that automatically runs scripts on webpages.

Install the extension and add the scripts (copy-paste the whole script into the editor) using TamperMonkey's dashboard.

### Alternative setup with TamperMonkey

To avoid updating the script manually through the dashboard every time it changes, you can have Tampermonkey source the script directly from your file system.

The script may look something like this:
```
// ==UserScript==
// @name Generals Test
// @namespace http://tampermonkey.net
// @version 0.1
// @description Source the generals script from file system
// @match http://generals.io/*
// @require file://path/to/repo/src/PluginsManager.js
// ==/UserScript==
```
