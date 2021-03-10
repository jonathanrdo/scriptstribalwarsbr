/*
 * Script Name: Map Barbs Only
 * Version: v1.0.1
 * Last Updated: 2020-07-26
 * Author: RedAlert
 * Author URL: https://twscripts.ga/
 * Author Contact: RedAlert#9859 (Discord)
 * Approved: t14107291
 * Approved Date: 2020-07-26
 * Mod: JawJaw
 */

var scriptData = {
	name: 'Map Barbs Only',
	version: 'v1.0.1',
	author: 'RedAlert',
	authorUrl: 'https://twscripts.ga/',
	helpLink: 'https://forum.tribalwars.net/index.php?threads/map-barbs-only.285715/#',
};

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Globals
var mapOverlay;
if ('TWMap' in window) mapOverlay = TWMap;

// Translations
var translations = {
	en_DK: {
		'Map Barbs Only': 'Map Barbs Only',
		Help: 'Help',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>',
		'Script is already loaded and running!': 'Script is already loaded and running!',
	},
	en_US: {
		'Map Barbs Only': 'Map Barbs Only',
		Help: 'Help',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>',
		'Script is already loaded and running!': 'Script is already loaded and running!',
	},
	pt_PT: {
		'Map Barbs Only': 'Mapa sÃ³ barbaras',
		Help: 'Ajuda',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'O script deve ser executado no <a href="/game.php?screen=map" class="btn">Mapa</a>',
		'Script is already loaded and running!': 'O script jÃ¡ foi executado e jÃ¡ estÃ¡ a funcionar!',
	},
	pt_BR: {
		'Map Barbs Only': 'Mapa sÃ³ barbaras',
		Help: 'Ajuda',
		'Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>':
			'O script deve ser executado no <a href="/game.php?screen=map" class="btn">Mapa</a>',
		'Script is already loaded and running!': 'O script jÃ¡ foi executado e jÃ¡ estÃ¡ a funcionar!',
	},
};

// Init Debug
initDebug();

// Init Translations Notice
initTranslationsNotice();

// Initialize Map Barbs Only
function initMapBarbsOnly() {
	var content = `
        <div id="ra-map-filters" class="vis">
            <h3>${tt(scriptData.name)}</h3>
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
            #ra-map-filters { position: fixed; top: 10vw; right: 10vw; z-index: 100; width: 360px; padding: 10px; background: #e3d5b3 url('/graphic/index/main_bg.jpg') scroll right top repeat; }
            .custom-close-button { right: 0; top: 0; }
        </style>
    `;

	mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
	TWMap.mapHandler.spawnSector = spawnSectorReplacer;
	mapOverlay.villages = TWMap.villages;

	const villagesData = mapOverlay.villages;

	for (key in villagesData) {
		if (villagesData.hasOwnProperty(key)) {
			const currentVillage = villagesData[key];
			doMapFiltering(currentVillage);
		}
	}

	if (jQuery('#ra-map-filters').length < 1) {
		jQuery('body').append(content);
		jQuery('#ra-map-filters').draggable();
	} else {
		UI.ErrorMessage(tt('Script is already loaded and running!'));
	}
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
				doMapFiltering(v);
			}
		}
	}
}

// Helper: Filter out villages
function doMapFiltering(village) {
	if (village.owner != 0) {
		jQuery('#map_container > div:first-child').css({
			display: 'none',
		});
		jQuery(`[id="map_village_${village.id}"]`).css({
			display: 'none',
		});
		jQuery(`[id="map_icons_${village.id}"]`).css({
			display: 'none',
		});
		jQuery('#map_village_undefined').css({
			display: 'none',
		});
		jQuery('img[src="/graphic/map/reserved_player.png"]').css({
			display: 'none',
		});
		jQuery('img[src="/graphic/map/reserved_team.png"]').css({
			display: 'none',
		});
		jQuery('#map canvas').css({
			display: 'none',
		});
	}
}

// Close Draggable Element
function closeDraggableEl() {
	jQuery('#ra-map-filters').remove();
	var mapOverlay = TWMap;
	mapOverlay.mapHandler.spawnSector = mapOverlay.mapHandler._spawnSector;
	mapOverlay.villages = TWMap.villages;
	mapOverlay.reload();
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
		initMapBarbsOnly();
	} else {
		UI.ErrorMessage(
			`${tt('Script must be executed from the <a href="/game.php?screen=map" class="btn">Map</a>')}`,
			4000
		);
	}
})();
