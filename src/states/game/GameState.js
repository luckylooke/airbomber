 var GameState = function (game) {
        
        this.bmd = null;
    
        this.points = {
            'x': [],
            'y': []
        };
        this.POINTS_LENGTH = 10;

        this.tank = null;
        this.turret = null;
        this.flame = null;
        this.bullet = null;

        this.background = null;
        this.targets = null;
        this.land = null;
        this.emitter = null;

        this.power = 300;
        this.powerText = null;

        this.cursors = null;
        this.fireButton = null;

    };

    GameState.prototype = {

        init: function () {

            this.game.renderer.renderSession.roundPixels = true;

            this.game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

            this.physics.startSystem(Phaser.Physics.ARCADE);

        },

        preload: function () {

            //  We need this because the assets are on Amazon S3
            //  Remove the next 2 lines if running locally
            this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue002/';
            this.load.crossOrigin = 'anonymous';

            this.load.image('tank', 'assets/tank.png');
            this.load.image('turret', 'assets/turret.png');
            this.load.image('bullet', 'assets/bullet.png');
            // this.load.image('background', 'assets/background.png');
            this.load.image('flame', 'assets/flame.png');
            this.load.image('target', 'assets/target.png');
            // this.load.image('land', 'assets/land.png');

            //  Note: Graphics from Amiga Tanx Copyright 1991 Gary Roberts

        },

        create: function () {

            //  Simple but pretty background
            // this.background = this.add.sprite(0, 0, 'background');
            this.stage.backgroundColor = '#555555';
            
            var py = this.points.y,
                px = this.points.x,
                gamew = this.game.width,
                gameh = this.game.height,
                step = parseInt(gamew / this.POINTS_LENGTH);
            
            this.land = this.add.bitmapData(gamew, gameh);
            this.land.addToWorld();
    
            for (var i = 1; i < this.POINTS_LENGTH-1; i++)
            {
                px[i] = i*step;
                py[i] = this.rnd.between(30, gameh-30);
            }
            
            px[0] = 0;
            py[0] = gameh/2;
            px.push(gamew);
            py.push(gameh/2);
            
            console.log(px, py);
    
            this.plot();
            this.land.update();
            this.land.addToWorld();

            //  The targets to hit (hidden behind the land slightly)
            // this.targets = this.add.group(this.game.world, 'targets', false, true, Phaser.Physics.ARCADE);

            // this.targets.create(284, 378, 'target');
            // this.targets.create(456, 153, 'target');
            // this.targets.create(545, 305, 'target');
            // this.targets.create(726, 391, 'target');
            // this.targets.create(972, 74, 'target');

            //  Stop gravity from pulling them away
            // this.targets.setAll('body.allowGravity', false);

            //  The land is a BitmapData the size of the game world
            //  We draw the 'lang.png' to it then add it to the world
            // this.land = this.add.bitmapData(window.innerWidth, window.innerHeight);
            // this.land.draw('land');

            //  A small burst of particles when a target is hit
            this.emitter = this.add.emitter(0, 0, 30);
            this.emitter.makeParticles('flame');
            this.emitter.setXSpeed(-120, 120);
            this.emitter.setYSpeed(-100, -200);
            this.emitter.setRotation();

            //  A single bullet that the tank will fire
            this.bullet = this.add.sprite(0, 0, 'bullet');
            this.bullet.exists = false;
            this.physics.arcade.enable(this.bullet);

            //  The body of the tank
            this.tank = this.add.sprite(24, 383, 'tank');

            //  The turret which we rotate (offset 30x14 from the tank)
            this.turret = this.add.sprite(this.tank.x + 30, this.tank.y + 14, 'turret');

            //  When we shoot this little flame sprite will appear briefly at the end of the turret
            this.flame = this.add.sprite(0, 0, 'flame');
            this.flame.anchor.set(0.5);
            this.flame.visible = false;

            //  Used to display the power of the shot
            this.power = 300;
            this.powerText = this.add.text(8, 8, 'Power: 300', { font: "18px Arial", fill: "#ffffff" });
            this.powerText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
            this.powerText.fixedToCamera = true;

            //  Some basic controls
            this.cursors = this.input.keyboard.createCursorKeys();
    
            this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.fireButton.onDown.add(this.fire, this);

        },

        plot: function () {
            // http://phaser.io/tutorials/coding-tips-008
    
            this.land.clear();
    
            var x = 2 / game.width;
            var ctx = this.land.ctx;
            ctx.beginPath();
            ctx.moveTo(0, game.height);
    
            for (var i = 0; i <= 1; i += x)
            {
                // var px = this.math.linearInterpolation(this.points.x, i);
                // var py = this.math.linearInterpolation(this.points.y, i);
    
                var px = this.math.bezierInterpolation(this.points.x, i);
                var py = this.math.bezierInterpolation(this.points.y, i);
    
                // var px = this.math.catmullRomInterpolation(this.points.x, i);
                // var py = this.math.catmullRomInterpolation(this.points.y, i);
    
                // this.land.rect(px, py, 1, 1, 'rgba(255, 255, 255, 1)');
                ctx.lineTo(px, py);
            }
            
            ctx.lineTo(game.width, game.height);
            ctx.closePath();
            ctx.fillStyle = 'green';
            ctx.fill();
    
            for (var p = 0; p < this.points.x.length; p++)
            {
                this.land.rect(this.points.x[p]-5, this.points.y[p]-5, 10, 10, 'rgba(255, 0, 0, 1)');
            }
    
        },

        /**
         * Called by update if the bullet is in flight.
         *
         * @method bulletVsLand
         */
        bulletVsLand: function () {

            //  Simple bounds check
            if (this.bullet.x < 0 || this.bullet.x > this.game.world.width || this.bullet.y > this.game.height)
            {
                this.removeBullet();
                return;
            }

            var x = Math.floor(this.bullet.x);
            var y = Math.floor(this.bullet.y);
            var rgba = this.land.getPixel(x, y);

            if (rgba.a > 0)
            {
                this.land.blendDestinationOut();
                this.land.circle(x, y, 16, 'rgba(0, 0, 0, 255');
                this.land.blendReset();
                this.land.update();

                //  If you like you could combine the above 4 lines:
                // this.land.blendDestinationOut().circle(x, y, 16, 'rgba(0, 0, 0, 255').blendReset().update();

                this.removeBullet();
            }

        },

        /**
         * Called by fireButton.onDown
         *
         * @method fire
         */
        fire: function () {

            if (this.bullet.exists)
            {
                return;
            }

            //  Re-position the bullet where the turret is
            this.bullet.reset(this.turret.x, this.turret.y);

            //  Now work out where the END of the turret is
            var p = new Phaser.Point(this.turret.x, this.turret.y);
            p.rotate(p.x, p.y, this.turret.rotation, false, 34);

            //  And position the flame sprite there
            this.flame.x = p.x;
            this.flame.y = p.y;
            this.flame.alpha = 1;
            this.flame.visible = true;

            //  Boom
            this.add.tween(this.flame).to( { alpha: 0 }, 100, "Linear", true);

            //  So we can see what's going on when the bullet leaves the screen
            this.camera.follow(this.bullet);

            //  Our launch trajectory is based on the angle of the turret and the power
            this.physics.arcade.velocityFromRotation(this.turret.rotation, this.power, this.bullet.body.velocity);

        },

        /**
         * Called by physics.arcade.overlap if the bullet and a target overlap
         *
         * @method hitTarget
         * @param {Phaser.Sprite} bullet - A reference to the bullet (same as this.bullet)
         * @param {Phaser.Sprite} target - The target the bullet hit
         */
        hitTarget: function (bullet, target) {

            this.emitter.at(target);
            this.emitter.explode(2000, 10);

            target.kill();

            this.removeBullet(true);

        },

        /**
         * Removes the bullet, stops the camera following and tweens the camera back to the tank.
         * Have put this into its own method as it's called from several places.
         *
         * @method removeBullet
         */
        removeBullet: function (hasExploded) {

            if (typeof hasExploded === 'undefined') { hasExploded = false; }

            this.bullet.kill();
            this.camera.follow();

            var delay = 1000;

            if (hasExploded)
            {
                delay = 2000;
            }

            this.add.tween(this.camera).to( { x: 0 }, 1000, "Quint", true, delay);

        },

        /**
         * Core update loop. Handles collision checks and player input.
         *
         * @method update
         */
        update: function () {

            //  If the bullet is in flight we don't let them control anything
            if (this.bullet.exists)
            {
                //  Bullet vs. the Targets
                this.physics.arcade.overlap(this.bullet, this.targets, this.hitTarget, null, this);

                //  Bullet vs. the land
                this.bulletVsLand();
            }
            else
            {
                //  Allow them to set the power between 100 and 600
                if (this.cursors.left.isDown && this.power > 100)
                {
                    this.power -= 2;
                }
                else if (this.cursors.right.isDown && this.power < 600)
                {
                    this.power += 2;
                }

                //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
                if (this.cursors.up.isDown && this.turret.angle > -90)
                {
                    this.turret.angle--;
                }
                else if (this.cursors.down.isDown && this.turret.angle < 0)
                {
                    this.turret.angle++;
                }

                //  Update the text
                this.powerText.text = 'Power: ' + this.power;
            }

        }

    };
    
module.exports = GameState;