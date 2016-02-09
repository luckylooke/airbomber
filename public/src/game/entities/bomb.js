var AudioPlayer = require("../util/audio_player");

var Bomb = function (x, y, id) {
    Phaser.Sprite.call(this, game, x, y, "bomb");
    this.id = id;

    this.anchor.setTo(.5, .5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.sizeTween = game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 700, Phaser.Easing.Default, true, 0, true, true);
    this.animations.add('bomb',[0,1,2],1.5,true);
    game.add.existing(this);
    this.animations.play('bomb');
};

Bomb.prototype = Object.create(Phaser.Sprite.prototype);

Bomb.prototype.remove = function () {
    this.destroy();
    this.animations.stop();
    this.sizeTween.stop();
};

Bomb.renderExplosion = function (explosions) {
    console.dir(level.deadGroup);
    explosions.forEach(function (explosion) {
        var explosionSprite = new Phaser.Sprite(game, explosion.x, explosion.y, explosion.key, 0);
        explosionSprite.anchor.setTo(.5, .5);
        explosionSprite.animations.add("explode");
        explosionSprite.animations.getAnimation("explode").onComplete.add(function () {
            level.deadGroup.push(this);
        }, explosionSprite);

        game.world.addAt(explosionSprite, 1);

        explosionSprite.play("explode", 17, false);
        AudioPlayer.playBombSound();
    });
};

module.exports = Bomb;