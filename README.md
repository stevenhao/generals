# generals

A collection of scripts for the game [generals.io](www.generals.io).

## Setup with TamperMonkey

[TamperMonkey](http://tampermonkey.net/) is a Chrome Extension that automatically runs scripts on webpages.

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
You'll also need to give Tampermonkey access to your file system by checking the box "Allow access to file URLs" (which is next to "Allow in incognito) in Chrome's extensions page (chrome://extensions).

### Experimental Features

To enable experimental features, you must
- block the execution of generals-prod.js.
- load the modified version (src/generals-prod-modified.js)

You can use TamperMonkey to load generals-prod-modified as usual.

You can use AdBlock to block generals-prod.js: add the line `generals-bundle-prod-v9.0.js` to your filters, in AdBlock options.
