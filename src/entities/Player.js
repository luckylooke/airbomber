import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor({ game, x, y, asset, xSpawn, ySpawn, facing, id, color }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)
    
    this.xSpawn = xSpawn;
  	this.ySpawn = ySpawn;
  	this.x = xSpawn;
  	this.y = ySpawn;
  	this.facing = facing;
  	this.id = id;
  	this.color = color;
  	this.wins = 0;
  	this.alive = true;
  	this.bombStrength = 1;
  	this.bombCapacity = 3;
  	this.numBombsAlive = 0;

  }

  // update() {
  //   this.angle += 1
  // }
  
  resetForNewRound() {
		this.x = this.xSpawn;
		this.y = this.ySpawn;
		this.facing = "down";
		this.alive = true;
		this.bombStrength = 1;
		this.bombCapacity = 3;
		this.numBombsAlive = 0;
	}

}
