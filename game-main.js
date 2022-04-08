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
                y: 0
            },
            debug: false
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


/********************************************************* */
new Phaser.Game(config);

/********************************************************* */
function preload() {

    this.load.tilemapTiledJSON("carte", "assets/testedelv2.json");
    this.load.image("tiles", "assets/floor.png")

    this.load.image('sky', 'assets/sky.png')
        //this.load.image('blueshot', 'assets/tirbleu.png')
        //this.load.image('greenshot', 'assets/tirver.png')
        //this.load.image('redshot', 'assets/tirrouge.png')
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.load.spritesheet('foot', 'assets/foot.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    this.load.spritesheet('persoiddle', 'assets/astromarin.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    let perso = this.load.spritesheet('perso', 'assets/spriteastromarin.png', {
        frameWidth: 32,
        frameHeight: 32
    })
    this.load.spritesheet('monstre', 'assets/monstre.png', {
        frameWidth: 32,
        frameHeight: 32
    })
    this.load.spritesheet('blueshot', 'assets/tirbleu.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    this.load.spritesheet('greenshot', 'assets/tirver.png', {
        frameWidth: 32,
        frameHeight: 32

    });
    this.load.spritesheet('redshot', 'assets/tirrouge.png', {
        frameWidth: 32,
        frameHeight: 32
    });


}

/********************************************************* */
let weaponsList = ["rifle", "lasercutter", "machinegun"]
let weaponsAvailable = ["rifle"]
let weaponsDef = {
    "rifle": {
        currentAmmo: 150,
        ammoBase: 15,
        image: "...../png",
        bullet: "blueshot",
        bullet_speed: 80,
        cadence: 500,
        lifespan: 1000,
        damage: 2,
        maxShot: 100,

    },
    "machinegun": {
        currentAmmo: 1500,
        ammoBase: 150,
        image: "...../png",
        bullet: "greenshot",
        bullet_speed: 80,
        cadence: 50,
        lifespan: 1000,
        damage: 2,
        maxShot: 100,
    },
    "lasercutter": {
        currentAmmo: 10000,
        ammoBase: 10000,
        image: "...../png",
        bullet: "redshot",
        bullet_speed: 80,
        cadence: 1,
        lifespan: 75,
        damage: 2,
        maxShot: 5000,
    },
}

/********************************************************* */
var light;
var player;
var cursors;
var stars;
var rifleAmmo = 1500;
var monstres = false;
var gameOver = false;
var spacebar;
var keyT;
var keyZ;
var keyQ;
var keyS;
var keyD;
var bullets;
var speed;
var stats;
var lastFired = 0;
var isDown = false;
var mouseX = 0;
var mouseY = 0;
var UICam
var currentScene

var playerSpeed
playerSpeed = 500
var maxShoot
maxShoot = 5000
var lifeShoot
lifeShoot = 75
var cadenceShoot
cadenceShoot = 0

/********************************************************* */
function checkDash(player, direction, velocity) {
    if ((Phaser.Input.Keyboard.JustDown(spacebar))) {
        //console.log("DASH ON")
        player.setVelocityX(velocity);
        player.dash = true;
        player.dashCounter = 0;
    }
}

/********************************************************* */
function checkJump(player) {
    if (player.jumpCount == undefined) {
        player.jumpCount = 0;
    }

    if (player.jumpCount <= 0 && Phaser.Input.Keyboard.JustDown(doubleJump)) {
        player.setVelocityY(-330); //alors vitesse verticale négative
        player.jumpCount += 1;
    }

    if (player.jumpCount > 0 && player.body.touching.down) {
        player.jumpCount = 0;
    }
}

/********************************************************* */
function updatePlayerWeapon(player) {
    player.weaponName = weaponsList[player.weaponIndex]
    player.weapon = player.weaponList[player.weaponName]
}

/********************************************************* */
function collectBonus(player, bonus) {
    console.log("Bonus collected!!!", player, bonus)
    if (bonus == undefined || bonus.properties == undefined) return
    if (bonus.properties.typeBonus == "ammo") {
        bonus.destroy()
        currentScene.collectible.removeTileAt(bonus.x, bonus.y)
        player.weapon.currentAmmo += 10
        console.log("AMMO")
        scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo);
        return
    }
    if (bonus.properties.typeBonus == "gun") {
        bonus.destroy()
        currentScene.collectible.removeTileAt(bonus.x, bonus.y)
        if (weaponsAvailable.length == 2) {
            weaponsAvailable.push("machinegun")
        }
        if (weaponsAvailable.length == 1) {
            weaponsAvailable.push("lasercutter")
        }
        return
    }
    if (bonus.properties.typeBonus == "pv") {
        bonus.destroy()
        currentScene.collectible.removeTileAt(bonus.x, bonus.y)
        player.pv += 1
        if (player.pv > 3)
            player.pv = 3
        pvText.setText('PV : ' + player.pv + '/3')
        return

    }
    if (bonus.properties.typeBonus == "redkey") {
        bonus.destroy()
        currentScene.collectible.removeTileAt(bonus.x, bonus.y)
        player.redKey = true
        redKeyText.setText('red KEY')
        return
    }
    //console.log("Bonus collected!!!", player, bonus)
}
/********************************************************* */
function destroyProps(player, prop) {
    console.log("TOUCH")
    if (prop.properties.wallType == 'laser' && player.redKey == true) {
        console.log("LASER OPEN")
        prop.destroy()
        currentScene.cassable.removeTileAt(prop.x, prop.y)
        return
    }
}
/********************************************************* */
function shootProps(bullet, prop) {
    if (player.weaponName == "lasercutter") {
        console.log("WALL DESTROY")
        prop.destroy()
        currentScene.cassable.removeTileAt(prop.x, prop.y)
        return
    }
}


/********************************************************* */
function create() {
    currentScene = this
    const carteDuNiveau = this.add.tilemap("carte");

    const tileset = carteDuNiveau.addTilesetImage(
        "floor",
        "tiles"
    );
    this.vaisseau = carteDuNiveau.createLayer(
        "CalquedeTuiles1",
        tileset
    );
    this.cassable = carteDuNiveau.createLayer(
        "bloquecasable",
        tileset
    );
    this.collectible = carteDuNiveau.createLayer(
        "colectible",
        tileset
    );
    this.monstre = carteDuNiveau.createLayer(
        "monstre",
        tileset
    );

    this.monstre.setScale(4)
    this.monstre.setDepth(10)
    console.log(this.monstre)
    this.vaisseau.setScale(4)
    this.cassable.setScale(4)
    this.cassable.setDepth(10)
    this.collectible.setScale(4)
    this.collectible.setDepth(10)
    this.vaisseau.setCollisionByProperty({ estSolide: true }, true)
    this.cassable.setCollisionByProperty({ estSolide: true }, true)
    this.collectible.setCollisionByProperty({ estCollectible: true }, true)
    this.vaisseau.setDepth(8)
        /*const debugGraphics = this.add.graphics().setAlpha(0.75)
            this.vaisseau.renderDebug(debugGraphics, {
                    tileColor: null, // Color of non-colliding tiles
                    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                })*/
        // Player definition
    player = this.physics.add.sprite(500 * 2, 450 * 3, 'perso').setScale(4).refreshBody();
    player.setBounce(0)
    player.setCollideWorldBounds(true)
    player.setDepth(10)
    player.pv = 1
    player.redKey = false
    player.weaponIndex = 0
    player.weaponList = Object.assign({}, weaponsDef)
    updatePlayerWeapon(player)

    this.physics.add.collider(player, this.vaisseau)
    this.physics.add.collider(player, this.cassable, destroyProps, null, this)

    this.physics.add.collider(player, this.collectible, collectBonus, null, this)

    this.anims.create({
        key: 'monstreMove',
        frames: this.anims.generateFrameNumbers('monstre', {
            start: 0,
            end: 3
        }),
        frameRate: 3,
        repeat: -1
    });
    this.anims.create({
        key: 'footside',
        frames: this.anims.generateFrameNumbers('foot', {
            start: 0,
            end: 15
        }),
        frameRate: 10,
        repeat: -1

    });
    this.anims.create({
        key: 'footup',
        frames: this.anims.generateFrameNumbers('foot', {
            start: 16,
            end: 31
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'footiddle',
        frames: this.anims.generateFrameNumbers('foot', {
            start: 0,
            end: 0
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'moving',
        frames: this.anims.generateFrameNumbers('perso', {
            start: 0,
            end: 7
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'iddle',
        frames: this.anims.generateFrameNumbers('persoiddle', {
            start: 0,
            end: 0
        }),
        frameRate: 10,
        repeat: -1
    });


    cursors = this.input.keyboard.createCursorKeys()

    //affiche un texte à l’écran, pour le score
    // Text ammo 
    scoreText = this.add.text(16, 16, (player.weaponName + 'Ammo: ' + player.weapon.currentAmmo), {
        fontSize: '32px',
        fill: '#000'
    })
    pvText = this.add.text(15, 64, ('PV : ' + player.pv + '/3'), {
        fontSize: '32px',
        fill: '#000'
    })
    redKeyText = this.add.text(15, 128, ('key missing'), {
        fontSize: '32px',
        fill: '#000'
    })
    redKeyText.setColor('red')
    redKeyText.setScrollFactor(1)
    scoreText.setColor('white')
    scoreText.setScrollFactor(1)
    pvText.setColor('green')
    pvText.setScrollFactor(1)

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {
            x: 12,
            y: 0,
            stepX: 70
        }

    });
    stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, this.vaisseau);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    monstres = this.physics.add.group();
    this.physics.add.collider(monstres, this.vaisseau);
    this.physics.add.collider(player, monstres, hitMonstre, null, this);


    this.input.keyboard.enabled = true
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyT = this.input.keyboard.addKey('t');
    keyZ = this.input.keyboard.addKey('z');
    keyQ = this.input.keyboard.addKey('q');
    keyD = this.input.keyboard.addKey('d');
    keyS = this.input.keyboard.addKey('s');
    doubleJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    player.playerFoot = this.physics.add.sprite(100, 450, 'foot').setScale(4).refreshBody()
    player.setBounce(0)
    player.setCollideWorldBounds(true)
    player.playerFoot.setDepth(9)
    this.physics.add.collider(player.playerFoot, this.vaisseau)

    var Bullet = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize: function Bullet(scene) {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, player.weapon.bullet)

            this.incX = 0
            this.incY = 0
            this.lifespan = 0
            this.setDepth(8)
            this.speed = Phaser.Math.GetSpeed(1000, 1)
        },

        fire: function(x, y) {
            this.setTexture(player.weapon.bullet)
            this.setActive(true)
            this.setVisible(true)

            var angle = Phaser.Math.Angle.Between(x, y, player.x - player.xcamera, player.y - player.ycamera)
            this.setRotation(angle)

            this.incX = Math.cos(angle)
            this.incY = Math.sin(angle)

            this.setPosition(player.x - (this.incX * 70), player.y - (this.incY * 70))

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
        }
    })

    bullets = this.physics.add.group({
        classType: Bullet,
        maxSize: player.weapon.maxShot, //munition max afficher a l'ecran
        runChildUpdate: true
    })

    this.physics.add.overlap(bullets, monstres, shootMonstre, null, this)
    this.physics.add.overlap(bullets, this.vaisseau, shootWall, null, this)
    this.physics.add.overlap(bullets, this.cassable, shootProps, null, this)

    this.input.on('pointerdown', function(pointer) {

        isDown = true;
        mouseX = pointer.x;
        mouseY = pointer.y;

    })
    this.input.on('pointermove', function(pointer) {

        mouseX = pointer.x;
        mouseY = pointer.y;

    })
    this.input.on('pointerup', function(pointer) {

        isDown = false;

    })

    this.physics.world.setBounds(0, 0, 3200 * 4, 3200 * 4)
    this.cameras.main.setBounds(0, 0, 3200 * 4, 3200 * 4)
    this.cameras.main.startFollow(player)
    this.cameras.main.ignore([scoreText, pvText])

    /*console.log("TILES1")
    let idList = []
    for (let i = 0; i < 35; i++) {
        let id = i + 15
        idList.push({ id: id, key: "monstre" })
    }
    this.monsterSprites = carteDuNiveau.createFromObjects("monstersObjects", idList)
    for (let monster of this.monsterSprites) {

    };*/

    //this.enemis = this.physics.add.group({
    //allowGravity: false,
    //});

    //carteDuNiveau.getObjectLayer('nathanMonstre').objects.forEach((enemiPlace) => {
    //this.enemi = this.enemis.create(enemiPlace.x, enemiPlace.y, 'monstre').setOrigin(0).setScale(4).setDepth(0);
    //console.log("Ta mere connard", this.enemis)
    //});

    /*let monstreLayer = carteDuNiveau.createFromTiles(46, 45, { key: 'monstre' }, this, this.cameras.main)
    console.log("TILES12", this.monsterSprites)*/

    UICam = this.cameras.add(0, 0, 3200, 600)
    UICam.ignore([player, player.playerFoot, stars, this.vaisseau, this.collectible, this.cassable, this.monstre])

    /*this.enemi.setBounce(1);
    this.enemis.setVelocityY(-100)*/


}

/********************************************************* */
function hitMonstre(player, monstre) {
    this.physics.pause();
    player.setTint(0xff0000)
    gameOver = true;
    this.scene.restart()
    rifleAmmo = 15
    scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.baseAmmo)

}

/********************************************************* */
function shootWall(bullet, wall) {
    if (wall.properties.estSolide) {
        console.log("Wall", wall)
        bullet.destroy()
        bullet.lifespan = 0
    }
}

/********************************************************* */
function shootMonstre(player, monstre) {
    console.log("ici")
    bullet.lifespan = 0
    monstre.disableBody(true, true)
}

/********************************************************* */
function collectStar(player, star) {
    star.disableBody(true, true); // l’étoile disparaît
    rifleAmmo += 10; //augmente le score de 10
    scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo); //met à jour l’affichage du score 
    if (stars.countActive(true) === 0) { // si toutes les étoiles sont prises
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        }); // on les affiche toutes de nouveau
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(400, 400);
        // si le perso est à gauche de l’écran, on met une bombe à droite
        // si non, on la met à gauche de l’écran
        var monstre = monstres.create(x, 16, 'bomb')
        monstre.anims.play('monstreMove', true)
        monstre.setBounce(1)
        monstre.setCollideWorldBounds(true)
        monstre.setVelocity(Phaser.Math.Between(-200, 200), 20)
        UICam.ignore([monstre])
    }
}

/********************************************************* */
function update(time, delta) {

    if (Phaser.Input.Keyboard.JustDown(keyT)) {
        player.weaponIndex += 1
        if (player.weaponIndex >= weaponsAvailable.length) {
            player.weaponIndex = 0
        }
        updatePlayerWeapon(player)
        scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo);
    }

    if (Phaser.Input.Keyboard.DownDuration(keyZ, 100000)) {
        player.setVelocityY(-playerSpeed)
        player.movingy = true
        player.playerFoot.anims.play('footup', true)
        player.anims.play('moving', true)


    } else if (Phaser.Input.Keyboard.DownDuration(keyS, 100000)) {
        player.setVelocityY(playerSpeed)
        player.movingy = true
        player.playerFoot.anims.play('footup', true)
        player.anims.play('moving', true)

    } else {
        player.setVelocityY(0)
        player.movingy = false
    }
    if (Phaser.Input.Keyboard.DownDuration(keyD, 100000)) {
        player.setVelocityX(playerSpeed)
        player.movingx = true
        player.playerFoot.anims.play('footside', true)
        player.anims.play('moving', true)

    } else if (Phaser.Input.Keyboard.DownDuration(keyQ, 100000)) {
        player.setVelocityX(-playerSpeed)
        player.movingx = true
        player.playerFoot.anims.play('footside', true)
        player.anims.play('moving', true)

    } else {
        player.setVelocityX(0)
        player.movingx = false
    }
    //console.log(player, player.velocityX, player.velocityY)
    if (player.movingx == false && player.movingy == false) {
        console.log("IDDLE")
        player.anims.play('iddle', true)
        player.playerFoot.anims.play('footiddle', true)
    }
    if ((isDown && time > lastFired)) {
        var bullet = bullets.get();
        UICam.ignore([bullet])

        if (bullet && player.weapon.currentAmmo > 0) {
            bullet.fire(mouseX, mouseY);
            player.weapon.currentAmmo--;
            scoreText.setText(player.weaponName + 'Ammo: ' + player.weapon.currentAmmo); //met à jour l’affichage du score 
            lastFired = time + player.weapon.cadence; //duréé de la rafale
        }

    }

    player.xcamera = Math.floor(this.cameras.main.worldView.x)
    player.ycamera = Math.floor(this.cameras.main.worldView.y)
    player.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, player.x - player.xcamera, player.y - player.ycamera) - Math.PI / 2)
    player.playerFoot.x = player.x
    player.playerFoot.y = player.y
    player.setDepth(10)

}