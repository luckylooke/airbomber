var Map = require("../entity/map");
var Player = require("../entity/player");
var Bomb = require("../entity/bomb");
TILE_SIZE = 35;
var should = require('should');
var supertest = require('supertest');

describe('Bomb test:', function () {
    var test_map = {};
    var map = null;
    var players = {};
    var bomb = null;
    before(function () {
        test_map.tiles = [3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 0, 4, 0, 4, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 0, 4, 0, 4, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3];
        test_map.height = 7;
        test_map.width = 7;
        test_map.destructibleTileId = 4;
        map = new Map(test_map, 35);
        var player1 = new Player(85, 45, 'down', 1, 'white');
        var player2 = new Player(150, 115, 'down', 2, 'white');
        players[player1.id] = player1;
        players[player2.id] = player2;
    });
    describe('Existence functionality:', function () {
        it('should be have #detonate bomb', function () {
            should(Bomb.prototype).have.property('detonate');
        });
        it('should be have #length explosion', function () {
            should(Bomb.prototype).have.property('generateExplosionInDirection');
            should(Bomb.prototype).have.property('generateIndividualExplosion');
        });
    });
    it('Detonate Bomb', function () {
        bomb = new Bomb(125, 85, function () {
        });
        should(bomb.detonate(map, players[1].bombStrength, players)).containEql({
            killedPlayers: [],
            destroyedBlocks: [{row: 2, col: 4, itemId: map.mapData[2][4]}, {row: 2, col: 2, itemId: map.mapData[2][2]}]
        });
    });
    it('kill player', function () {
        bomb = new Bomb(125, 85, function () {
        });
        players[2].x = 125;
        players[2].y = 125;
        should(bomb.detonate(map, players[1].bombStrength, players)).containEql({
            killedPlayers: [2]
        });
    });
});

