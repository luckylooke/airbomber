var MapInfo = {
	First: {
		spawnLocations: [{x: 1, y: 1}, {x: 24, y: 1}, {x: 1, y: 4}, {x: 24, y: 4}],
		collisionTiles: [3, 4],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 4
	},
	Second: {
		spawnLocations: [{x: 2, y: 1}, {x: 13, y: 1}, {x: 2, y: 13}, {x: 13, y: 13}],
		collisionTiles: [169, 191],
		groundLayer: "Ground",
		blockLayer: "Blocks",
		tilesetName: "tiles",
		tilesetImage: "tiles",
		destructibleTileId: 191
	}
};

module.exports = MapInfo;