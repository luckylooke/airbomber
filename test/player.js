var Player = require("../entity/player");

var should = require('should');
var supertest = require('supertest');

describe('Player test:', function () {
    var player = new Player(32, 32, 'down', 1, 'white');
    it('should be have #reset for new round', function () {
        should(Player.prototype).have.property('resetForNewRound');
    });
    it('right primary data when creating object', function () {
        (player.x).should.eql(32);
        (player.y).should.eql(32);
        (player.bombStrength).should.eql(1);
        (player.bombCapacity).should.eql(3);
        (player.bombCapacity).should.eql(3);
        (player.numBombsAlive).should.eql(0);
    });

});
