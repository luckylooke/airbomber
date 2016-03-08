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
	Third: {
		name: "Desert2",
		thumbnailFile: "../resource/danger_desert_thumbnail.png",
		tilemapName: "Third",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/danger_desert_background.png",
		spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 13}, {x: 23, y: 13}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 4
	}
};

module.exports = MapInfo;