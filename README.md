# generals

A collection of scripts for the game [generals.io](www.generals.io).

# List of scripts

- **MountainsWatcher (for FFA)**: Watches for new obstacles/mountains appearing in the map. This reveals the location of captured generals. The script consults the chat log to determine the color of the player that captured the general, and highlights the square containing the captured general with that color. Explanation: *When a general is captured, it turns into a city. Generals don't show up as obstacles in the fog of war, but cities do, so any new city/obstacle must be a newly-captured general.*

- **LeaderboardWatcher**: Watches the leaderboard for changes in army size. Allows you to easily read off how many cities a player has, whether the player is in a fight, whether the player just captured a city, etc.

- **BetterControls** (requires experimental features): Allows for easier and faster keyboard control. Every time you make a move, the script will automatically select the destination square. Although true queueing cannot be implemented, with a decent internet connection you should make be able to reliably make 2 moves per turn.

- **GeneralsHighlighter**: Helps you remember enemy general locations. When you find an enemy general, this script will label it with a red outline, which will remain even after the general is no longer visible by your army.

- **AutoPan**: Automatically and smoothly moves the map to keep your currently selected square comfortably visible. Accounting for variable window sizes, this script will ensure that all squares within a radius of 3 of the selected square are located in the visible part of the document window.

- **DvorakControls**: Allows dvorak typists to play the game without switching to QWERTY.

## Setup with TamperMonkey

[TamperMonkey](http://tampermonkey.net/) is a Chrome Extension that automatically runs scripts on webpages.

Install the extension and add the scripts (copy-paste the whole script into the editor) using TamperMonkey's dashboard.

### Alternative setup with TamperMonkey

To avoid updating the scripts manually through the dashboard every time it changes, you can have Tampermonkey source the scripts directly from your file system.

The script may look something like this:
```
// ==UserScript==
// @name Generals Test
// @namespace http://tampermonkey.net
// @version 0.1
// @description Source the generals script from file system
// @match http://generals.io/*
// @require file://path/to/repo/src/pluginManager.js
// @require file://path/to/repo/src/mountainsWatcher.js
// @require file://path/to/repo/src/generals-prod-modified.js
// @require file://path/to/repo/src/betterControls.js
// @require ...
// ==/UserScript==
```
You'll also need to give Tampermonkey access to your file system by checking the box "Allow access to file URLs" (which is next to "Allow in incognito) in Chrome's extensions page (chrome://extensions).

### Experimental Features

To enable experimental features, you must
- block the execution of generals-prod.js.
- load the modified version (src/generals-prod-modified.js)

You can use TamperMonkey to load generals-prod-modified as usual.

You can use AdBlock to block generals-main-prod-vXX.X.X.js: add the line `generals-main-*.js` to your custom filters, in AdBlock options.
