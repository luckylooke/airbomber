var Map = require("../entity/map");

var should = require('should');
var supertest = require('supertest');

describe('Map test:', function () {
    var test_map = {};
    var map = null;
    before(function () {
        test_map.tiles = [3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 0, 4, 0, 4, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 0, 4, 0, 4, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3];
        test_map.height = 7;
        test_map.width = 7;
        test_map.destructibleTileId = 4;
        map = new Map(test_map, 35);
    });
    describe('Existence functionality:', function () {
        it('should be have #test hit', function () {
            should(Map.prototype).have.property('hitTest');
        });
        it('should be have #success place bomb on grid', function () {
            should(Map.prototype).have.property('placeBombOnGrid');
        });
        it('should be have #if destroy tile thin check Bonus', function () {
            should(Map.prototype).have.property('destroyTile');
        });
        it('should be have #validate bomb in location', function () {
            should(Map.prototype).have.property('bombExistsAtLocation');
        });
        it('should be have #if player get Bonus', function () {
            should(Map.prototype).have.property('claimPowerup');
        });
        it('should be have #remove bomb from grid', function () {
            should(Map.prototype).have.property('destroyTile');
        });
    });
    it('seize map can be above 4 and type Array', function () {
        should(map.mapData.length).be.above(4);
        should(map.mapData).be.an.Array.and.an.Object;
    });
    it('seize tile can be above 20', function () {
        should(map.tileSize).be.above(20);
    });
    it('right work function hitTest', function () {
        should(map.hitTest(125, 85)).eql({row: 2, col: 3, hitBlock: 0});
    });
    it('right work function placeBombOnGrid', function () {
        should(map.placeBombOnGrid(125, 85)).eql({x: 122.5, y: 87.5});
        should(map.placedBombs[2][3]).eql(1);
        should(map.placeBombOnGrid(125, 85)).eql(-1);
    });
    it('right work function destroyTile', function () {
        should([0, 5, 6, 7]).containEql(map.destroyTile(2, 2));
    });
    it('right work function removeBombFromGrid', function () {
        map.removeBombFromGrid(125, 85);
        should(map.placedBombs[2][3]).eql(0);
    });
});

