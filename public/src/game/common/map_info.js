var MapInfo = {
	GreenField: {
		name: "Green Field",
		thumbnailFile: "../resource/green_field_thumbnail.png",
		tilemapName: "GreenField",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/green_field_background.png",
		spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 13}, {x: 23, y: 13}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 4
	},
	GreenHell: {
		name: "Green Hell",
		thumbnailFile: "../resource/green_hell_thumbnail.png",
		tilemapName: "GreenHell",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/green_hell_background.png",
		spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 13}, {x: 23, y: 13}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 4
	},
	DesertGraveyard: {
		name: "Desert Graveyard",
		thumbnailFile: "../resource/desert_graveyard_thumbnail.png",
		tilemapName: "DesertGraveyard",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/desert_graveyard_background.png",
		spawnLocations: [{x: 11, y: 6}, {x: 13, y: 6}, {x: 11, y: 8}, {x: 13, y: 8}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "desertTiles",
		tilesetImage: "desertTiles",
		destructibleTileId: 4
	},
	DesertCanyon: {
		name: "Desert Canyon",
		thumbnailFile: "../resource/desert_canyon_thumbnail.png",
		tilemapName: "DesertCanyon",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/desert_canyon_background.png",
		spawnLocations: [{x: 3, y: 4}, {x: 8, y: 10}, {x: 16, y: 4}, {x: 21, y: 10}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "desertTiles",
		tilesetImage: "desertTiles",
		destructibleTileId: 4
	}
	
};

module.exports = MapInfo;