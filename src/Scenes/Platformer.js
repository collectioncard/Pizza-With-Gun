class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {

        my.bgm = this.sound.add("music");
    // variables and settings        
        this.physics.world.gravity.y = 1900;
        //this.worldBoundsX = SCALE * 18 * (215); //scale = 2, 18 = width of tile, x = num tiles
        //this.worldBoundsY = SCALE * 18 * (40);
        //this.physics.world.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY, 64, true, true, false, true);

        this.camera = this.cameras.main;
        this.sprite = {};
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
//SPRITES------------------------------------------------------------
    //xMark for Signs
        this.sprite.xMark = this.add.sprite(0, 0, "x").setScale(SCALE).setVisible(true).setDepth(1).setAlpha(0);
    //HintText
        this.sprite.hintText = this.add.text(0, 0, 'A and D to move', { fontFamily: 'font1', fontSize: '42px', fill: '#FFFFFFF',  stroke: '#FFFFFF', strokeThickness: 10}).setOrigin(.5).setPosition(game.config.width/2, game.config.height - 160).setDepth(1).setAngle(-20).setScrollFactor(0);
    //Timer Text
        this.timer = new LevelTimer(this, 0, 0, '999', { fontFamily: 'font1', fontSize: '37px', fill: '#FFFFFFF', stroke: '#FFFFFF', strokeThickness: 10 }, 999);
    //Background
        this.bg1 = this.add.tileSprite(game.config.width, -500, game.config.width, game.config.height, 'bgGrass').setScale(4).setScrollFactor(.05).setScale(5).setDepth(-10);

        
//----------------------------------------------------------------

//TILEMAP--------------------------------------------------------------
    //initMap
        this.protoRoomConfig = {
            key: "platformer-level-1",
            tileWidth: 18,
            tileHeight: 18,
            width: 45,
            height: 25

        }
        this.enemygroup = this.add.group({
            classType: Enemy,
            maxSize: 100,
            // activate update calls
            runChildUpdate: true
        });
        this.playerGroup = this.add.group();
        this.coingroup = this.add.group();
        this.signGroup = this.add.group();
        this.collidesTrue = this.add.group();
        this.oneWays = this.add.group();

        //this.map = this.createOldRoom("platformer-level-1", 18, 18, 45, 25);

        this.room2 = this.createRoom("Room1", 18, 18, 0, -20*18*2);
        this.room1 = this.createRoom("Room2", 18, 18, 20*18*2, 0);
        this.room3 = this.createRoom("Room1", 18, 18, 0, 0);
        this.room4 = this.createRoom("Room2", 18, 18, 20*18*2, -20*18*2);
    

    //-----------------------------------------------------------------------------
//-------------------------------------------------------------------------------------

// PlayerInit---------------------------------

    this.sprite.player = new Player(this, this.playerSpawn[0].x, this.playerSpawn[0].y, "platformer_characters", "tile_0000.png");
    this.playerGroup.add(this.sprite.player);
        //WaterOverlap
        this.physics.add.overlap(this.sprite.player, this.waterPool, (obj1, obj2) => {
            
            if (this.timer.timerTimer) {
                this.sound.play("jingle");
                let tempText = this.add.text(0, 0, 'YOU WIN!!!', { fontFamily: 'font1', fontSize: '42px', fill: '#5ad28c',  stroke: '#FFFFFF', strokeThickness: 15}).setOrigin(.5).setPosition(game.config.width/2, game.config.height/2).setDepth(10).setAngle(-20).setScrollFactor(0);
                this.tweens.add({
                    targets     : tempText,
                    alpha     : 0,
                    ease        : 'Cubic.In',
                    duration    : 2000,
                });
                this.timer.timerTimer.destroy();
                this.timer.timerTimer = false;//:)
            }
            
        });
//-----------------------------------------------
// Controls-------------------------
        cursors = this.input.keyboard.createCursorKeys();
        my.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        my.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        my.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    //debug key listener (assigned to D key)
        if (game.config.physics.arcade.debug) {
            this.input.keyboard.on('keydown-G', () => {
                this.sprite.player.setDepth(0);
                this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
                this.physics.world.debugGraphic.clear()
            }, this);
            this.input.keyboard.on('keydown-L', () => {
                this.timer.time = 0;
                this.sprite.player.y = 0;
            }, this);
        }
        
    //Signbutton- Set signtext, toggle sign text visibility
        this.input.keyboard.on('keydown-X', () => {
            this.sprite.signText.text = this.sprite.player.signTouch.name;
            this.sprite.signText.visible = !this.sprite.signText.visible;
            this.sprite.signBoard.visible = !this.sprite.signBoard.visible;
        }, this);
//--------------------------------------

//Camera------------------------------------
        this.camera.startFollow(this.sprite.player, true, .1, .1);
        this.camera.width = game.config.width;
        this.camera.height = game.config.height;
        this.camera.setViewport(0, 0, game.config.width, game.config.height);
        //this.camera.setBounds(0, 0, this.worldBoundsX, this.worldBoundsY);
        this.camera.setZoom(game.config.width/1200 * 1.20, game.config.height/700 * 1.20);
        //this.camera.setDeadzone(100, 100);
//-----------------------------------------

//Tweens---------------------------------

    //xMark grow/shrink, just constantly on, might technically be performance loss idk
        this.sprite.xMark.tween = this.tweens.add({
            targets     : this.sprite.xMark,
            scale     : 1.5,
            ease        : 'Linear',
            duration    : 600,
            yoyo: true,
            repeat: -1
        });

    //Starting hint text tween, bouncy, also i assume this ends and gets destroyed when text does
        this.tweens.add({
            targets     : this.sprite.hintText,
            angle      : 20,
            ease        : 'Cubic.In',
            duration    : 500,
            repeat: -1,
            yoyo: true
        });
//---------------------------------------------
//Particles?------------------------------------
        
//-----------------------------------------------

//Start Musics Music Playback
        this.sound.play("jingle");
        this.time.delayedCall(
            734,                // ms
            ()=>{
                my.bgm.play({ loop:true, seek: 100, rate: 1});
            }
        )
        my.bgm.rateVar = 1;

//-------------------------------------    
    }

    update() {

    this.sprite.player.update();            

//Extra Checks------------------------

    //SignTimer- Tricky to get signs to disapear reasonably, I had alot of flickering
        //While touching sign create/reset timer, once its gone thing should go away
        if (this.signTouchTimer != undefined && this.signTouchTimer.getRemaining() != 0) {
            this.sprite.xMark.x = this.sprite.player.signTouch.x;
            this.sprite.xMark.y = this.sprite.player.signTouch.y - 50;
            this.sprite.xMark.visible = true;
            this.sprite.xMark.alpha = 1;
            this.sprite.xMark.tween.resume();
        } else {
            this.tweens.add({
                targets     : this.sprite.xMark,
                alpha      : 0,
                ease        : 'Linear',
                duration    : 180,
                onComplete: () => {
                    this.sprite.xMark.tween.pause();
                }
            });
            this.sprite.signText.visible = false;
            this.sprite.signBoard.visible = false;
        }

    //Remove hint once move
        if (this.sprite.hintText && (this.sprite.player.moving || (cursors.up.isDown||my.keySpace.isDown))) {
            if (this.timer.timerTimer.paused == true) {
                this.timer.timerTimer.paused = false;
            }
            //this.sprite.hintText
            this.tweens.add({
                targets     : this.sprite.hintText,
                alpha      : 0,
                ease        : 'Quart.Out',
                duration    : 600,
                onComplete: () => {
                    this.sprite.hintText.destroy();
                },
            });
        }
        //Camera Offset
        if (this.sprite.player.running > 1) {
            this.add.tween({
                targets: this.camera.followOffset,
                x: -300 * this.sprite.player.facing * ((Math.abs(this.sprite.player.body.velocity.x) / (this.sprite.player.MAXVELOCITYX + 100))),
                duration: 400,
                ease: 'Linear'
            });
        } else {
            this.add.tween({
                targets: this.camera.followOffset,
                x: 0,
                duration: 200,
                ease: 'LinearOut'
            });
        }
        
        this.timer.update();

//------------------------------------------------------
    }

    /* createOldRoom(key, tileWidth, tileHeight, width, height) {
        let map = this.add.tilemap(key, tileWidth, tileHeight, width, height);
        map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");

            //groundLayer
            map.groundLayer = map.createLayer("Ground-n-Platforms", ["kenny_tilemap_packed","tilemap-backgrounds_packed"], 0, 0);
            map.groundLayer.setScale(SCALE);
        //topLayer
            map.topLayer = map.createLayer("Above-Ground", ["kenny_tilemap_packed","tilemap-backgrounds_packed"], 0, 0);
            map.topLayer.setScale(SCALE);
            map.topLayer.setAlpha(.8).setDepth(1);
            this.animatedTiles.init(map);
        //collision layer
            map.colLayer = map.createLayer("Collision-Layer", ["kenny_tilemap_packed","tilemap-backgrounds_packed"], 0, 0);
            map.colLayer.setScale(SCALE);
            map.colLayer.setAlpha(0);
            map.colLayer.setCollisionByProperty({
                collides: true
            });
            this.collidesTrue.add(map.colLayer);
        //oneWay
            map.oneWLayer = map.createLayer("One-Layer", ["kenny_tilemap_packed","tilemap-backgrounds_packed"], 0, 0);
            map.oneWLayer.setScale(SCALE);
            map.oneWLayer.setAlpha(0);
            map.oneWLayer.setCollisionByProperty({
                oneWay: true
            });
            this.oneWays.add(map.oneWLayer);
        //Background- --have to change tileset before creating-- JK
            map.botLayer = map.createLayer("Below-Ground", ["kenny_tilemap_packed","tilemap-backgrounds_packed"], 0, 0);
            map.botLayer.setScale(5);
            map.botLayer.setDepth(-1);
            map.botLayer.setScrollFactor(.2);

    //Collection Layer------------------------------------------------------------------------
        //COINS
        let coins = map.createFromObjects("Objects", {
            type: "coin",
            key: "coin"
        });

        coins.map((coin) => {
            coin.scale = SCALE;
            coin.setDepth(10);
            coin.x *= SCALE;
            coin.y *= SCALE;
            this.physics.world.enable(coin, Phaser.Physics.Arcade.STATIC_BODY);
            coin.play('coinTurn');
            this.coingroup.add(coin);
        });
        

        //SIGNS
        let signs = map.createFromObjects("Objects", {
            type: "sign",
            key: "sign"
        });
        signs.map((sign) => {
            sign.scale = SCALE;
            sign.x *= SCALE;
            sign.y *= SCALE;
            this.physics.world.enable(sign, Phaser.Physics.Arcade.STATIC_BODY);
            this.signGroup.add(sign);
        });

        //Player Spawn
        this.playerSpawn = map.createFromObjects("Objects", {
            type: "player",
            key: "coin"
        });
        this.playerSpawn.map((spawn) => {
            spawn.scale = SCALE;
            spawn.x *= SCALE;
            spawn.y *= SCALE;
            spawn.visible = false;

        });
        //Enemy
        let enemySpawn = map.createFromObjects("Objects", {
            type: "enemSpawn",
            key: "platformer_characters",
            frame: "tile_0024.png",
        });
        enemySpawn.map((enemy) => {
            enemy.scale = SCALE;
            enemy.x *= SCALE;
            enemy.y *= SCALE;

            let newEnemy = new Enemy(this, enemy.x, enemy.y, "platformer_characters", "tile_0024.png");
            newEnemy.facing = enumList.LEFT;
            this.enemygroup.add(newEnemy);
            enemy.destroy();//Refactor possibility
        });
        //Water
        this.waterPool = map.createFromObjects("Objects", {
            type: "waterPool",
            key: ""
        });
        this.waterPool.map((water) => {
            water.scale = SCALE;
            water.x *= SCALE;
            water.y *= SCALE;
            water.displayHeight = 36;
            water.displayWidth = 180;
            water.visible = false;
            this.physics.world.enable(water, Phaser.Physics.Arcade.STATIC_BODY);
        });

        return(map);
    } */

    /*Notes so far:
    Layers have to be known on demand, creating a layer the map doenst have give an error. --Got layer by layer stuff working
    Objects are NOT the same, if an object doesn't exist, its fine to check anyways.

    Current needs for a room: key, x, y, tile x, tile y,
    Probably will want: room width, room height, spritesheets needed, ?doors?, 
    
    */
    createRoom(key, tileWidth, tileHeight, x, y) {
        let map = this.add.tilemap(key, tileWidth, tileHeight);
        map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        map.addTilesetImage("tilemap-backgrounds_packed", "background_tiles");
        map.layers.forEach(layer => {
        
            let curLayer = map.createLayer(layer.name, ["kenny_tilemap_packed","tilemap-backgrounds_packed"], x, y);
            curLayer.setScale(SCALE);

            if (layer.name == "Collision-Layer") {
                curLayer.setAlpha(0);
                curLayer.setCollisionByProperty({
                    collides: true
                });
                this.collidesTrue.add(curLayer);

            } else if (layer.name == "One-Layer") {
                curLayer.setAlpha(0);
                curLayer.setCollisionByProperty({
                    oneWay: true
                });
                this.oneWays.add(map.oneWLayer);
            }
            
        });
        this.animatedTiles.init(map);

    //Collection Layer------------------------------------------------------------------------
        //COINS
        let coins = map.createFromObjects("Objects", {
            type: "coin",
            key: "coin"
        });
        
        coins.map((coin) => {
            coin.scale = SCALE;
            coin.x *= SCALE;
            coin.y *= SCALE;
            coin.x += x;
            coin.y += y;
            this.physics.world.enable(coin, Phaser.Physics.Arcade.STATIC_BODY);
            coin.play('coinTurn');
            this.coingroup.add(coin);
        });


        //SIGNS
        let signs = map.createFromObjects("Objects", {
            type: "sign",
            key: "sign"
        });
        signs.map((sign) => {
            sign.setScale(SCALE);
            sign.x *= SCALE;
            sign.y *= SCALE;
            sign.x += x;
            sign.y += y;

            let newSign = new Sign(this, sign.x, sign.y, "sign", undefined, sign.name);
            this.signGroup.add(newSign);
            sign.destroy();
        });

        //Player Spawn
        if (!this.playerSpawn){
            this.playerSpawn = map.createFromObjects("Objects", {
                type: "player",
                key: "coin"
            });
            this.playerSpawn.map((spawn) => {
                spawn.scale = SCALE;
                spawn.x *= SCALE;
                spawn.y *= SCALE;
                spawn.x += x;
                spawn.y += y;
                spawn.visible = false;
    
            });
        }
        //Enemy
        let enemySpawn = map.createFromObjects("Objects", {
            type: "enemSpawn",
            key: "platformer_characters",
            frame: "tile_0024.png",
        });
        enemySpawn.map((enemy) => {
            enemy.scale = SCALE;
            enemy.x *= SCALE;
            enemy.y *= SCALE;
            enemy.x += x;
            enemy.y += y;

            let newEnemy = new Enemy(this, enemy.x, enemy.y, "platformer_characters", "tile_0024.png");
            newEnemy.facing = enumList.LEFT;
            this.enemygroup.add(newEnemy);
            enemy.destroy();
        });
        //Water
        this.waterPool = map.createFromObjects("Objects", {
            type: "waterPool",
            key: ""
        });
        this.waterPool.map((water) => {
            water.scale = SCALE;
            water.x *= SCALE;
            water.y *= SCALE;
            water.x += x;
            water.y += y;
            water.displayHeight = 36;
            water.displayWidth = 180;
            water.visible = false;
            this.physics.world.enable(water, Phaser.Physics.Arcade.STATIC_BODY);
        });

        return(map);
    }
 
}