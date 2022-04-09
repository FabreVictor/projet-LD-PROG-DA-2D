/********************************************************* */
const MONSTER_MAX_SPEED = 200;
const MONSTER_MIN_SPEED = 50;

/********************************************************* */
class GameUtility {

    /********************************************************* */
    static init(currentScene) {
        this.playerSpeed = 500
        this.isDown = false
        this.mouseX = 0
        this.mouseY = 0
        this.lastFired = 0
        this.currentScene = currentScene

        this.weaponsList = ['rifle', 'lasercutter', 'machinegun'];
        this.weaponsAvailable = ['rifle'];
        this.weaponsDef = {
            rifle: {
                currentAmmo: 150,
                ammoBase: 15,
                image: '...../png',
                bullet: 'blueshot',
                bullet_speed: 80,
                cadence: 500,
                lifespan: 1000,
                damage: 2,
                maxShot: 100,
            },
            machinegun: {
                currentAmmo: 1500,
                ammoBase: 150,
                image: '...../png',
                bullet: 'greenshot',
                bullet_speed: 80,
                cadence: 50,
                lifespan: 1000,
                damage: 2,
                maxShot: 100,
            },
            lasercutter: {
                currentAmmo: 10000,
                ammoBase: 10000,
                image: '...../png',
                bullet: 'redshot',
                bullet_speed: 80,
                cadence: 1,
                lifespan: 75,
                damage: 2,
                maxShot: 5000,
            },
        };
    }

    /********************************************************* */
    static commonPreload(currentScene) {
        this.currentScene = currentScene

        currentScene.load.image('tiles', 'assets/floor.png');
        currentScene.load.image('sky', 'assets/sky.png');
        currentScene.load.image('ground', 'assets/platform.png');
        currentScene.load.image('star', 'assets/star.png');
        currentScene.load.image('bomb', 'assets/bomb.png');

        currentScene.load.spritesheet('foot', 'assets/foot.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        currentScene.load.spritesheet('persoiddle', 'assets/astromarin.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        currentScene.load.spritesheet('perso', 'assets/spriteastromarin.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        currentScene.load.spritesheet('monstre', 'assets/monstre.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        currentScene.load.spritesheet('blueshot', 'assets/tirbleu.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        currentScene.load.spritesheet('greenshot', 'assets/tirver.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        currentScene.load.spritesheet('redshot', 'assets/tirrouge.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    /********************************************************* */
    static updatePlayerWeapon() {
            let player = this.player
            player.weaponName = this.weaponsList[player.weaponIndex]
            player.weapon = this.player.weaponList[player.weaponName]
        }
        /********************************************************* */
    static collectBonus(player, bonus) {
            //GameUtility.currentScene.scene.start('sceneB')

            console.log('Bonus collected!!!', player, bonus);
            if (bonus == undefined || bonus.properties == undefined) return;
            if (bonus.properties.typeBonus == 'ammo') {
                bonus.destroy();
                GameUtility.currentScene.collectible.removeTileAt(bonus.x, bonus.y);
                player.weapon.currentAmmo += 10;
                console.log('AMMO');
                GameUtility.scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo);
                return;
            }
            if (bonus.properties.typeBonus == 'gun') {
                bonus.destroy();
                GameUtility.currentScene.collectible.removeTileAt(bonus.x, bonus.y);
                if (GameUtility.weaponsAvailable.length == 2) {
                    GameUtility.weaponsAvailable.push('machinegun');
                }
                if (GameUtility.weaponsAvailable.length == 1) {
                    GameUtility.weaponsAvailable.push('lasercutter');
                }
                return;
            }
            if (bonus.properties.typeBonus == 'pv') {
                bonus.destroy();
                GameUtility.currentScene.collectible.removeTileAt(bonus.x, bonus.y);
                player.pv += 1;
                if (player.pv > 3) player.pv = 3;
                GameUtility.pvText.setText('PV : ' + player.pv + '/3');
                return;
            }
            if (bonus.properties.typeBonus == 'redkey') {
                bonus.destroy();
                GameUtility.currentScene.collectible.removeTileAt(bonus.x, bonus.y);
                player.redKey = true;
                GameUtility.redKeyText.setText('red KEY');
                return;
            }


            //console.log("Bonus collected!!!", player, bonus)
        }
        /********************************************************* */
    static destroyProps(player, prop) {
            if (prop.properties.wallType == 'laser' && player.redKey == true) {
                console.log('LASER OPEN')
                prop.destroy()
                GameUtility.currentScene.cassable.removeTileAt(prop.x, prop.y)
                return;
            }
        }
        /********************************************************* */
    static shootProps(bullet, prop) {
        if (GameUtility.player.weaponName == 'lasercutter') {
            console.log('WALL DESTROY')
            prop.destroy()
            GameUtility.currentScene.cassable.removeTileAt(prop.x, prop.y)
            return;
        }
    }

    /********************************************************* */
    static commonCreate(currentScene) {
        this.currentScene = currentScene

        currentScene.anims.create({
            key: 'monstreMove',
            frames: currentScene.anims.generateFrameNumbers('monstre', {
                start: 0,
                end: 3,
            }),
            frameRate: 3,
            repeat: -1,
        });
        currentScene.anims.create({
            key: 'footside',
            frames: currentScene.anims.generateFrameNumbers('foot', {
                start: 0,
                end: 15,
            }),
            frameRate: 10,
            repeat: -1,
        });
        currentScene.anims.create({
            key: 'footup',
            frames: currentScene.anims.generateFrameNumbers('foot', {
                start: 16,
                end: 31,
            }),
            frameRate: 10,
            repeat: -1,
        });
        currentScene.anims.create({
            key: 'footiddle',
            frames: currentScene.anims.generateFrameNumbers('foot', {
                start: 0,
                end: 0,
            }),
            frameRate: 10,
            repeat: -1,
        });
        currentScene.anims.create({
            key: 'moving',
            frames: currentScene.anims.generateFrameNumbers('perso', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });
        currentScene.anims.create({
            key: 'iddle',
            frames: currentScene.anims.generateFrameNumbers('persoiddle', {
                start: 0,
                end: 0,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.player = currentScene.physics.add
            .sprite(currentScene.playerStartX * 32 * 4, currentScene.playerStartY * 32 * 4, 'perso')
            .setScale(4)
            .refreshBody()
        this.player.setBounce(0)
        this.player.setCollideWorldBounds(true)
        this.player.setDepth(10)
        this.player.pv = 1;
        this.player.last_pv_lost_date = Date.now();
        this.player.redKey = false;
        this.player.weaponIndex = 0;
        this.player.weaponList = Object.assign({}, this.weaponsDef);
        this.updatePlayerWeapon(this.player)
        this.player.playerFoot = currentScene.physics.add.sprite(100, 450, 'foot').setScale(4).refreshBody();
        this.player.playerFoot.setDepth(9)
        currentScene.physics.add.collider(this.player.playerFoot, currentScene.vaisseau)

        let player = this.player
        currentScene.physics.add.collider(player, currentScene.vaisseau);
        currentScene.physics.add.collider(player, currentScene.cassable, this.destroyProps, null, currentScene);
        currentScene.physics.add.collider(player, currentScene.collectible, this.collectBonus, null, currentScene);

        //affiche un texte à l’écran, pour le score
        // Text ammo
        this.scoreText = currentScene.add.text(16, 16, player.weaponName + 'Ammo: ' + player.weapon.currentAmmo, {
            fontSize: '32px',
            fill: '#000',
        });
        this.pvText = currentScene.add.text(15, 64, 'PV : ' + player.pv + '/3', {
            fontSize: '32px',
            fill: '#000',
        });
        this.redKeyText = currentScene.add.text(15, 128, 'key missing', {
            fontSize: '32px',
            fill: '#000',
        });
        this.redKeyText.setColor('red');
        this.redKeyText.setScrollFactor(1);
        this.scoreText.setColor('white');
        this.scoreText.setScrollFactor(1);
        this.pvText.setColor('green');
        this.pvText.setScrollFactor(1);

        this.cursors = currentScene.input.keyboard.createCursorKeys()
        currentScene.input.keyboard.enabled = true
            //spacebar = currentScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.keyT = currentScene.input.keyboard.addKey('t')
        this.keyZ = currentScene.input.keyboard.addKey('z')
        this.keyQ = currentScene.input.keyboard.addKey('q')
        this.keyD = currentScene.input.keyboard.addKey('d')
        this.keyS = currentScene.input.keyboard.addKey('s')

        var Bullet = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize: function Bullet(scene) {
                Phaser.GameObjects.Image.call(this, scene, 0, 0, GameUtility.player.weapon.bullet);

                this.incX = 0;
                this.incY = 0;
                this.lifespan = 0;
                this.setDepth(8);
                this.speed = Phaser.Math.GetSpeed(1000, 1);
            },

            fire: function(x, y) {

                let player = GameUtility.player;
                this.setTexture(player.weapon.bullet);
                this.setActive(true);
                this.setVisible(true);

                var angle = Phaser.Math.Angle.Between(x, y, player.x - player.xcamera, player.y - player.ycamera);
                this.setRotation(angle);

                this.incX = Math.cos(angle);
                this.incY = Math.sin(angle);

                this.setPosition(player.x - this.incX * 70, player.y - this.incY * 70);

                this.lifespan = player.weapon.lifespan; //porté tir
            },
            update: function(time, delta) {
                this.lifespan -= delta;

                this.x -= this.incX * (this.speed * delta);
                this.y -= this.incY * (this.speed * delta);

                if (this.lifespan <= 0) {
                    this.setActive(false);
                    this.setVisible(false);
                }
            },
        });

        this.bullets = currentScene.physics.add.group({
            classType: Bullet,
            maxSize: player.weapon.maxShot, //munition max afficher a l'ecran
            runChildUpdate: true,
        });

        currentScene.physics.add.overlap(this.bullets, currentScene.vaisseau, this.shootWall, null, currentScene)
        currentScene.physics.add.overlap(this.bullets, currentScene.cassable, this.shootProps, null, currentScene)

        currentScene.input.on('pointerdown', function(pointer) {
            GameUtility.isDown = true
            GameUtility.mouseX = pointer.x
            GameUtility.mouseY = pointer.y
        });
        currentScene.input.on('pointermove', function(pointer) {
            GameUtility.mouseX = pointer.x
            GameUtility.mouseY = pointer.y
        });
        currentScene.input.on('pointerup', function(pointer) {
            GameUtility.isDown = false
        });

        currentScene.physics.world.setBounds(0, 0, 3200 * 4, 3200 * 4)
        currentScene.cameras.main.setBounds(0, 0, 3200 * 4, 3200 * 4)
        currentScene.cameras.main.startFollow(this.player)
        currentScene.cameras.main.ignore([this.scoreText, this.pvText])

        this.monsterSprites = currentScene.carteDuNiveau.createFromObjects(
            'monstersObjects',
            currentScene.monsterIdList
        )
        currentScene.physics.world.enable(this.monsterSprites)
        for (let monster of this.monsterSprites) {
            currentScene.physics.world.enable(monster);
            Object.assign(
                monster,
                Phaser.Physics.Arcade.Components.Enable,
                Phaser.Physics.Arcade.Components.Velocity,
                Phaser.Physics.Arcade.Components.Bounce,
                Phaser.Physics.Arcade.Components.CollideWorldBounds
            );
            monster.x *= 4;
            monster.y += 32;
            monster.y *= 4;
            monster.setDepth(20);
            monster.setScale(4);
            monster.setBounce(1);
            monster.setCollideWorldBounds(true);
            let speedX = (Math.random() - 0.5) * MONSTER_MAX_SPEED;
            speedX = speedX < MONSTER_MIN_SPEED ? MONSTER_MIN_SPEED : speedX;
            let speedY = (Math.random() - 0.5) * MONSTER_MAX_SPEED;
            speedY = speedX < MONSTER_MIN_SPEED ? MONSTER_MIN_SPEED : speedX;
            monster.setVelocity(speedX, speedY);
        }
        currentScene.anims.play('monstreMove', this.monsterSprites)

        this.UICam = currentScene.cameras.add(0, 0, 3200, 600);
        this.UICam.ignore([
            player,
            player.playerFoot,
            currentScene.vaisseau,
            currentScene.collectible,
            currentScene.cassable,
            currentScene.monstre,
            this.monsterSprites,
        ])
        currentScene.physics.add.collider(player, this.monsterSprites, this.hitMonstre, null, currentScene)
        currentScene.physics.add.overlap(this.bullets, this.monsterSprites, this.shootMonstre, null, currentScene)
        currentScene.physics.add.collider(this.monsterSprites, currentScene.vaisseau)
        currentScene.physics.add.collider(this.monsterSprites, currentScene.cassable)

    }

    /********************************************************* */
    static hitMonstre(player) {
            let now = Date.now();
            if (now - player.last_pv_lost_date > 2000) {
                player.pv -= 1;
                GameUtility.pvText.setText('PV : ' + player.pv + '/3');
                if (player.pv <= 0) {
                    GameUtility.currentScene.physics.pause()
                    player.setTint(0xff0000)
                    GameUtility.currentScene.scene.restart()
                }
                player.last_pv_lost_date = now
            }
        }
        /********************************************************* */
    static shootWall(bullet, wall) {
        if (wall.properties.estSolide) {
            console.log('Wall', wall);
            bullet.destroy();
            bullet.lifespan = 0;
        }
    }

    /********************************************************* */
    static shootMonstre(monstre, bullet) {
        bullet.lifespan = 0;
        bullet.destroy();

        let v = Math.random();
        if (v <= 0.5) {
            let tile = GameUtility.currentScene.carteDuNiveau.putTileAt(
                GameUtility.currentScene.idAmmo,
                Math.floor(monstre.x / 32 / 4),
                Math.floor(monstre.y / 32 / 4),
                true,
                GameUtility.currentScene.collectible
            );
            tile.properties.estCollectible = true;
            tile.properties.typeBonus = 'ammo';
        } else {
            let tile = GameUtility.currentScene.carteDuNiveau.putTileAt(
                GameUtility.currentScene.idPv,
                Math.floor(monstre.x / 32 / 4),
                Math.floor(monstre.y / 32 / 4),
                true,
                GameUtility.currentScene.collectible
            );
            tile.properties.estCollectible = true;
            tile.properties.typeBonus = 'pv';
        }
        GameUtility.currentScene.collectible.setCollisionByProperty({ estCollectible: true }, true);

        monstre.destroy()
    }

    /********************************************************* */
    static commonUpdate(time, delta) {
        let player = this.player
        if (Phaser.Input.Keyboard.JustDown(this.keyT)) {
            player.weaponIndex += 1;
            if (player.weaponIndex >= this.weaponsAvailable.length) {
                player.weaponIndex = 0;
            }
            this.updatePlayerWeapon()
            this.scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo)
        }

        if (Phaser.Input.Keyboard.DownDuration(this.keyZ, 100000)) {
            player.setVelocityY(-this.playerSpeed)
            player.movingy = true
            player.playerFoot.anims.play('footup', true)
            player.anims.play('moving', true)
        } else if (Phaser.Input.Keyboard.DownDuration(this.keyS, 100000)) {
            player.setVelocityY(this.playerSpeed)
            player.movingy = true
            player.playerFoot.anims.play('footup', true);
            player.anims.play('moving', true)
        } else {
            player.setVelocityY(0)
            player.movingy = false
        }
        if (Phaser.Input.Keyboard.DownDuration(this.keyD, 100000)) {
            player.setVelocityX(this.playerSpeed)
            player.movingx = true
            player.playerFoot.anims.play('footside', true)
            player.anims.play('moving', true)
        } else if (Phaser.Input.Keyboard.DownDuration(this.keyQ, 100000)) {
            player.setVelocityX(-this.playerSpeed)
            player.movingx = true
            player.playerFoot.anims.play('footside', true)
            player.anims.play('moving', true)
        } else {
            player.setVelocityX(0)
            player.movingx = false
        }
        //console.log(player, player.velocityX, player.velocityY)
        if (player.movingx == false && player.movingy == false) {
            console.log('IDDLE')
            player.anims.play('iddle', true)
            player.playerFoot.anims.play('footiddle', true)
        }
        if (this.isDown && time > this.lastFired) {
            var bullet = this.bullets.get()
            this.UICam.ignore([bullet])

            if (bullet && player.weapon.currentAmmo > 0) {
                bullet.fire(this.mouseX, this.mouseY)
                player.weapon.currentAmmo--
                    this.scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo) //met à jour l’affichage du score
                this.lastFired = time + player.weapon.cadence //duréé de la rafale
            }
        }

        player.xcamera = Math.floor(this.currentScene.cameras.main.worldView.x)
        player.ycamera = Math.floor(this.currentScene.cameras.main.worldView.y)
        let angle = Phaser.Math.Angle.Between(this.mouseX, this.mouseY, player.x - player.xcamera, player.y - player.ycamera) - Math.PI / 2
        player.setRotation(angle)
        player.playerFoot.x = player.x
        player.playerFoot.y = player.y
        player.setDepth(10)
    }
}

/********************************************************* */
var SceneA = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function SceneA() {
        Phaser.Scene.call(this, { key: 'sceneA' });
    },

    preload: function() {
        this.load.tilemapTiledJSON('carte', 'assets/testedelv2.json');
        GameUtility.init(this)
        GameUtility.commonPreload(this)
    },

    create: function() {
        this.playerStartX = 10
        this.playerStartY = 10

        this.carteDuNiveau = this.add.tilemap('carte');
        this.tileset = this.carteDuNiveau.addTilesetImage('floor', 'tiles');
        this.vaisseau = this.carteDuNiveau.createLayer('CalquedeTuiles1', this.tileset);
        this.cassable = this.carteDuNiveau.createLayer('bloquecasable', this.tileset);
        this.collectible = this.carteDuNiveau.createLayer('colectible', this.tileset);
        this.monstre = this.carteDuNiveau.createLayer('monstre', this.tileset);
        this.monstre.setScale(4);
        this.monstre.setDepth(10);
        console.log(this.monstre);
        this.vaisseau.setScale(4);
        this.cassable.setScale(4);
        this.cassable.setDepth(10);
        this.collectible.setScale(4);
        this.collectible.setDepth(20);
        this.vaisseau.setCollisionByProperty({ estSolide: true }, true);
        this.cassable.setCollisionByProperty({ estSolide: true }, true);
        this.collectible.setCollisionByProperty({ estCollectible: true }, true);
        this.vaisseau.setDepth(8);

        this.monsterIdList = [];
        for (let i = 0; i < 35; i++) {
            let id = i + 15;
            this.monsterIdList.push({ id: id, key: 'monstre' });
        }
        this.idAmmo = 115;
        this.idPv = 135;

        GameUtility.commonCreate(this)
    },

    /********************************************************* */
    update: function(time, delta) {
        GameUtility.commonUpdate(time, delta)
    },
});
/********************************************************* */
var SceneB = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function SceneB() {
        Phaser.Scene.call(this, { key: 'sceneB' });
    },

    preload: function() {
        this.load.tilemapTiledJSON('carteLV2', 'assets/testedelv2L2.json')
        GameUtility.commonPreload(this)
    },

    create: function() {
        this.playerStartX = 9
        this.playerStartY = 10

        this.carteDuNiveau = this.add.tilemap('carteLV2');

        this.tileset = this.carteDuNiveau.addTilesetImage('floor', 'tiles');
        this.vaisseau = this.carteDuNiveau.createLayer('CalquedeTuiles1', this.tileset);
        this.cassable = this.carteDuNiveau.createLayer('bloquecasable', this.tileset);
        this.collectible = this.carteDuNiveau.createLayer('colectible', this.tileset);
        this.monstre = this.carteDuNiveau.createLayer('monstre', this.tileset);

        this.monstre.setScale(4);
        this.monstre.setDepth(10);
        console.log(this.monstre);
        this.vaisseau.setScale(4);
        this.cassable.setScale(4);
        this.cassable.setDepth(10);
        this.collectible.setScale(4);
        this.collectible.setDepth(10);
        this.vaisseau.setCollisionByProperty({ estSolide: true }, true);
        this.cassable.setCollisionByProperty({ estSolide: true }, true);
        this.collectible.setCollisionByProperty({ estCollectible: true }, true);
        this.vaisseau.setDepth(8);

        this.monsterIdList = []
        for (let i = 0; i < 72; i++) {
            let id = i + 48;
            this.monsterIdList.push({ id: id, key: 'monstre' })
        }
        this.idAmmo = 114
        this.idPv = 134
        GameUtility.commonCreate(this)
    },
    /********************************************************* */
    update: function(time, delta) {
        GameUtility.commonUpdate(time, delta)
    },

});

/********************************************************* */
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0,
            },
            debug: false,
        },
    },

    scene: [SceneA, SceneB],
};

new Phaser.Game(config)

/********************************************************* */