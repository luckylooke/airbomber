import Phaser from 'phaser'
import Player from 'Player'

export default class PlayersSystem{

  constructor({game}) {

    this.game = game;
    this.players = {};

  }

  add({x, y, asset, xSpawn, ySpawn, facing, id, color }) {
     var newPlayer = new Player({ game: this.game, x, y, asset, xSpawn, ySpawn, facing, id, color });
     this.players[id] = newPlayer;
     return newPlayer;
  }

}
