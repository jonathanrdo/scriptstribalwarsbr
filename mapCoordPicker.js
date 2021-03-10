/*
 * Script Name: Map Coord Picker
 * Version: v2.0.1
 * Last Updated: 2021-02-21
 * Author: RedAlert
 * Author URL: https://twscripts.ga/
 * Author Contact: RedAlert#9859 (Discord)
 * Approved: t14065247
 * Approved Date: 2020-07-04
 * Mod: JawJaw
 */

var scriptData = {
	name: 'Map Coord Picker',
	version: 'v2.0.1',
	author: 'RedAlert',
	authorUrl: 'https://twscripts.ga/',
	helpLink: 'https://forum.tribalwars.net/index.php?threads/map-coords-picker.285565/',
};

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Globals
var mapOverlay;
var selectedVillages = [];
if ('TWMap' in window) mapOverlay = TWMap;

// Translations
var translations = {
	en_DK: {
		'Map Coord Picker': 'Map Coord Picker',
		Help: 'Help',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>',
		'Script is already loaded and running!': 'Script is already loaded and running!',
		Reset: 'Reset',
		Copy: 'Copy',
		'Copied!': 'Copied!',
		'Nothing to be copied!': 'Nothing to be copied!',
		'Selection cleared!': 'Selection cleared!',
		'Selected villages:': 'Selected villages:',
	},
	en_US: {
		'Map Coord Picker': 'Map Coord Picker',
		Help: 'Help',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>',
		'Script is already loaded and running!': 'Script is already loaded and running!',
		Reset: 'Reset',
		Copy: 'Copy',
		'Copied!': 'Copied!',
		'Nothing to be copied!': 'Nothing to be copied!',
		'Selection cleared!': 'Selection cleared!',
		'Selected villages:': 'Selected villages:',
	},
	ro_RO: {
		'Map Coord Picker': 'Map Coord Picker',
		Help: 'Ajutor',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'Scriptul trebuie rulat de pe <a href="/game.php?screen=map" class="btn">Map</a>',
		'Script is already loaded and running!': 'Scriptul ruleaza deja!',
		Reset: 'Reset',
		Copy: 'Copiaza',
		'Copied!': 'Copiat!',
		'Nothing to be copied!': 'Nimic de copiat!',
		'Selection cleared!': 'Selectare golita!',
		'Selected villages:': 'Alege satele:',
	},
	sk_SK: {
		'Map Coord Picker': 'KoordinÃ¡ty z mapy',
		Help: 'Pomoc',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'Skript musÃ­ byÅ¥ spustenÃ½ z <a href="/game.php?screen=map" class="btn">Map</a>',
		'Script is already loaded and running!': 'Skript sa naÄÃ­tal a beÅ¾Ã­!',
		Reset: 'Reset',
		Copy: 'KopÃ­rovaÅ¥',
		'Copied!': 'SkopÃ­rovanÃ©!',
		'Nothing to be copied!': 'NiÄ na kopÃ­rovanie!',
		'Selection cleared!': 'OznaÄenia zmazanÃ©!',
		'Selected villages:': 'OznaÄenÃ© dediny:',
	},
};

// Init Debug
initDebug();

// Init Translations Notice
initTranslationsNotice();

// Initialize Map Coord Picker
function initMapCoordPicker() {
	const content = `
        <div id="ra-map-coord-grabber" class="vis">
            <h3>${tt(scriptData.name)}</h3>
            <p>
                ${tt('Selected villages:')} <span id="countSelectedVillages">0</span>
            </p>
            <textarea id="villageList" value=""></textarea>
            <a href="javascript:void(0);" class="btn btn-confirm-no" onClick="resetSelection();">
                ${tt('Reset')}
            </a>
            <a href="javascript:void(0);" class="btn btn-confirm-yes" onClick="copySelection();">
                ${tt('Copy')}
            </a>
            <br><br>
			<small>
				<strong>
					${tt(scriptData.name)} ${scriptData.version}
				</strong> -
				<a href="${scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">
					${scriptData.author}
				</a> -
				<a href="${scriptData.helpLink}" target="_blank" rel="noreferrer noopener">
					${tt('Help')}
				</a>
            </small>
            <a class="popup_box_close custom-close-button" onClick="closeDraggableEl();" href="#">&nbsp;</a>
        </div>
        <style>
            #ra-map-coord-grabber { position: fixed; top: 10vw; right: 10vw; z-index: 100; width: 314px; padding: 10px; background: #e3d5b3 url('/graphic/index/main_bg.jpg') scroll right top repeat; }
            #ra-map-coord-grabber textarea { width: 100%; height: 100px; resize: none; box-sizing: border-box; margin-bottom: 5px; }
            #countSelectedVillages { font-weight: 600; }
            .custom-close-button { right: 0; top: 0; }
        </style>
    `;

	if (jQuery('#ra-map-coord-grabber').length < 1) {
		jQuery('body').append(content);
		jQuery('#ra-map-coord-grabber').draggable();
	} else {
		UI.ErrorMessage(tt('Script is already loaded and running!'));
	}

	mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
	TWMap.mapHandler.spawnSector = spawnSectorReplacer;
	mapOverlay.map._DShandleClick = mapOverlay.map._handleClick;

	TWMap.map._handleClick = function (e) {
		let currentCoords = jQuery('#villageList').val();
		let pos = this.coordByEvent(e);
		let coord = pos.join('|');
		let village = TWMap.villages[pos[0] * 1000 + pos[1]];
		if (village && village.id) {
			if (!currentCoords.includes(coord)) {
				jQuery(`[id="map_village_${village.id}"]`).css({
					filter: 'brightness(200%) grayscale(100%)',
				});
				selectedVillages.push(coord);
				jQuery('#villageList').val(selectedVillages.join(' '));
				jQuery('#countSelectedVillages').text(selectedVillages.length);
			} else {
				selectedVillages = selectedVillages.filter((village) => village !== coord);
				jQuery('#villageList').val(selectedVillages.join(' '));
				jQuery(`[id="map_village_${village.id}"]`).css({ filter: 'none' });
				jQuery('#countSelectedVillages').text(selectedVillages.length);
			}
		}
		return false;
	};
}

// Override Map Sector Spawn
function spawnSectorReplacer(data, sector) {
	mapOverlay.mapHandler._spawnSector(data, sector);
	var beginX = sector.x - data.x;
	var endX = beginX + mapOverlay.mapSubSectorSize;
	var beginY = sector.y - data.y;
	var endY = beginY + mapOverlay.mapSubSectorSize;
	for (var x in data.tiles) {
		var x = parseInt(x, 10);
		if (x < beginX || x >= endX) {
			continue;
		}
		for (var y in data.tiles[x]) {
			var y = parseInt(y, 10);

			if (y < beginY || y >= endY) {
				continue;
			}
			var xCoord = data.x + x;
			var yCoord = data.y + y;
			var v = mapOverlay.villages[xCoord * 1000 + yCoord];
			if (v) {
				if (selectedVillages.length > 0) {
					var vXY = '' + v.xy;
					var vCoords = vXY.slice(0, 3) + '|' + vXY.slice(3, 6);
					if (selectedVillages.includes(vCoords)) {
						jQuery(`[id="map_village_${v.id}"]`).css({
							filter: 'brightness(200%) grayscale(100%)',
						});
					}
				}
			}
		}
	}
}

// Close Draggable Element
function closeDraggableEl() {
	jQuery('#ra-map-coord-grabber').remove();
	var mapOverlay = TWMap;
	mapOverlay.mapHandler.spawnSector = mapOverlay.mapHandler._spawnSector;
	mapOverlay.map._handleClick = mapOverlay.map._DShandleClick;
	mapOverlay.reload();
}

// Reset Selected coords
function resetSelection() {
	selectedVillages = [];
	jQuery('#villageList').val(selectedVillages.join(' '));
	jQuery('#countSelectedVillages').text(selectedVillages.length);
	TWMap.reload();
	UI.SuccessMessage(tt('Selection cleared!'), 4000);
}

// Copy selected coords
function copySelection() {
	const coords = jQuery('#villageList').val().trim();
	if (coords.length !== 0) {
		jQuery('#villageList').select();
		document.execCommand('copy');
		UI.SuccessMessage(tt('Copied!'), 4000);
	} else {
		UI.ErrorMessage(tt('Nothing to be copied!'), 4000);
	}
}

// Helper: Generates script info
function scriptInfo() {
	return `[${scriptData.name} ${scriptData.version}]`;
}

// Helper: Prints universal debug information
function initDebug() {
	console.debug(`${scriptInfo()} It works ðŸš€!`);
	console.debug(`${scriptInfo()} HELP:`, scriptData.helpLink);
	if (DEBUG) {
		console.debug(`${scriptInfo()} Market:`, game_data.market);
		console.debug(`${scriptInfo()} World:`, game_data.world);
		console.debug(`${scriptInfo()} Screen:`, game_data.screen);
		console.debug(`${scriptInfo()} Game Version:`, game_data.majorVersion);
		console.debug(`${scriptInfo()} Game Build:`, game_data.version);
		console.debug(`${scriptInfo()} Locale:`, game_data.locale);
		console.debug(`${scriptInfo()} Premium:`, game_data.features.Premium.active);
	}
}

// Helper: Get parameter by name
function getParameterByName(name, url = window.location.href) {
	return new URL(url).searchParams.get(name);
}

// Helper: Text Translator
function tt(string) {
	var gameLocale = game_data.locale;

	if (translations[gameLocale] !== undefined) {
		return translations[gameLocale][string];
	} else {
		return translations['en_DK'][string];
	}
}

// Helper: Translations Notice
function initTranslationsNotice() {
	const gameLocale = game_data.locale;

	if (translations[gameLocale] === undefined) {
		UI.ErrorMessage(
			`No translation found for <b>${gameLocale}</b>. <a href="${scriptData.helpLink}" class="btn" target="_blank" rel="noreferrer noopener">Add Yours</a> by replying to the thread.`,
			4000
		);
	}
}

// Initialize Script
(function () {
	const gameScreen = getParameterByName('screen');

	if (gameScreen === 'map') {
		initMapCoordPicker();
	} else {
		UI.ErrorMessage(
			`${tt('Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>')}`,
			4000
		);
	}
})();
