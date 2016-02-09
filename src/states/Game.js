/* global __DEV__ */
import Phaser from 'phaser'
// import Mushroom from '../sprites/Mushroom'
// import {setResponsiveWidth} from '../utils'

export default class extends Phaser.State {
//   constructor() {
//     super();

//   }

  init() {
    // nicer graphics
    this.game.renderer.renderSession.roundPixels = true;
    // take all available space
    this.game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
    
    this.physics.startSystem(Phaser.Physics.ARCADE);

  }

  preload() {

    // this.load.image('tank', 'assets/tank.png');

  }

  create() {

    this.stage.backgroundColor = '#555555';

    //  A small burst of particles when a target is hit
    // this.emitter = this.add.emitter(0, 0, 30);
    // this.emitter.makeParticles('flame');
    // this.emitter.setXSpeed(-120, 120);
    // this.emitter.setYSpeed(-100, -200);
    // this.emitter.setRotation();

  }

  /**
   * Core update loop. Handles collision checks and player input.
   *
   * @method update
   */
  update() {
      
      

        // //  Bullet vs. the Targets
        // this.physics.arcade.overlap(this.bullet, this.targets, this.hitTarget, null, this);

        // //  Bullet vs. the land
        // this.bulletVsLand();
        
        // //  Allow them to set the power between 100 and 600
        // if (this.cursors.left.isDown && this.power > 100)
        // {
        //     this.power -= 2;
        // }
        // else if (this.cursors.right.isDown && this.power < 600)
        // {
        //     this.power += 2;
        // }

        // //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
        // if (this.cursors.up.isDown && this.turret.angle > -90)
        // {
        //     this.turret.angle--;
        // }
        // else if (this.cursors.down.isDown && this.turret.angle < 0)
        // {
        //     this.turret.angle++;
        // }

        // //  Update the text
        // this.powerText.text = 'Power: ' + this.power;
    }
}
