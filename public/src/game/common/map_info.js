var MapInfo = {
	First: {
		name: "Green field",
		thumbnailFile: "../resource/green_field_thumbnail.png",
		tilemapName: "First",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/green_field_background.png",
		spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 4}, {x: 23, y: 4}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 4
	},
	Second: {
		name: "Green hell",
		thumbnailFile: "../resource/green_hell_thumbnail.png",
		tilemapName: "Second",
		maxPlayers: 4,
		size: "Small",
		background:"../resource/green_hell_background.png",
		spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 4}, {x: 23, y: 4}],
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
		spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 4}, {x: 23, y: 4}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 4
	}
};

module.exports = MapInfo;