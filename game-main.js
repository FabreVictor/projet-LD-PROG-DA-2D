var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
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


new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/sky.png')
    this.load.image('blueshot', 'assets/tirbleu.png')
    this.load.image('greenshot', 'assets/tirver.png')
    this.load.image('redshot', 'assets/tirrouge.png')
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('persoiddle', 'assets/astromarin.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    this.load.spritesheet('perso', 'assets/spriteastromarin.png', {
        frameWidth: 32,
        frameHeight: 32
    })
}

/*function create(){
  this.add.image(400, 300, 'sky');
  this.add.image(400, 300, 'star');

  //game.tKey = game.input.keyboard.addKey( 't')
}*/
let weaponsList = ["rifle", "machinegun", "lasercutter"]
let weaponsDef = {
    "rifle": {
        currentAmmo: 15,
        ammoBase: 15,
        image: "...../png",
        bullet: "blueshot",
        bullet_speed: 2,
        cadence: 50,
        lifespan: 1000,
        damage: 2,
        maxShot: 100,

    },
    "machinegun": {
        currentAmmo: 15,
        ammoBase: 00,
        image: "...../png",
        bullet: "greenshot",
        bullet_speed: 2,
        cadence: 50,
        lifespan: 1000,
        damage: 2,
        maxShot: 100,
    },
    "lasercutter": {
        currentAmmo: 15,
        ammoBase: 00,
        image: "...../png",
        bullet: "redshot",
        bullet_speed: 2,
        cadence: 1,
        lifespan: 75,
        damage: 2,
        maxShot: 5000,
    },
}

var platforms;
var light
var player;
var cursors;
var stars;
var rifleAmmo = 1500;
var bombs = false;
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

var playerSpeed
playerSpeed = 200
var maxShoot
maxShoot = 5000
var lifeShoot
lifeShoot = 75
var cadenceShoot
cadenceShoot = 0




function checkDash(player, direction, velocity) {
    if ((Phaser.Input.Keyboard.JustDown(spacebar))) {
        //console.log("DASH ON")
        player.setVelocityX(velocity);
        player.dash = true;
        player.dashCounter = 0;
    }
}

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

function updatePlayerWeapon(player) {
    player.weaponName = weaponsList[player.weaponIndex]
    player.weapon = Object.assign({}, weaponsDef[player.weaponName])
}

function create() {


    let sky = this.add.image(400, 300, 'sky')
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Player definition
    player = this.physics.add.sprite(100, 450, 'perso')
    player.setBounce(0)
    player.setCollideWorldBounds(true)
    player.weaponIndex = 0
    updatePlayerWeapon(player)

    this.physics.add.collider(player, platforms)

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
    scoreText = this.add.text(16, 16, 'Rifle Ammo: ' + rifleAmmo, {
        fontSize: '32px',
        fill: '#000'
    })
    scoreText.setColor('white')
    scoreText.setScrollFactor(1)

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
    }); //chaque étoile va rebondir un peu différemment

    this.physics.add.collider(stars, platforms);
    //et collisionne avec les plateformes
    this.physics.add.overlap(player, stars, collectStar, null, this);
    //le contact perso/étoile ne génère pas de collision (overlap)
    //mais en revanche cela déclenche une fonction collectStar
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);


    this.input.keyboard.enabled = true
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyT = this.input.keyboard.addKey('t');
    keyZ = this.input.keyboard.addKey('z');
    keyQ = this.input.keyboard.addKey('q');
    keyD = this.input.keyboard.addKey('d');
    keyS = this.input.keyboard.addKey('s');
    doubleJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    var Bullet = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize: function Bullet(scene) {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, player.weapon.bullet);

            this.incX = 0;
            this.incY = 0;
            this.lifespan = 0;

            this.speed = Phaser.Math.GetSpeed(600, 1);
        },
        fire: function(x, y) {
            this.setActive(true);
            this.setVisible(true);

            //  Bullets fire from the middle of the screen to the given x/y
            this.setPosition(player.x, player.y);

            var angle = Phaser.Math.Angle.Between(x, y, player.x - player.xcamera, player.y - player.ycamera)

            this.setRotation(angle);

            this.incX = Math.cos(angle);
            this.incY = Math.sin(angle);

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
    this.physics.add.overlap(bullets, bombs, shootBomb, null, this)
    this.physics.add.collider(bullets, platforms, shootWall, null, this);
    this.input.on('pointerdown', function(pointer) {

        isDown = true;
        mouseX = pointer.x;
        mouseY = pointer.y;

    });

    this.input.on('pointermove', function(pointer) {

        mouseX = pointer.x;
        mouseY = pointer.y;

    });

    this.input.on('pointerup', function(pointer) {

        isDown = false;

    })
    this.physics.world.setBounds(0, 0, 3200, 600)
    this.cameras.main.setBounds(0, 0, 3200, 600)
    this.cameras.main.startFollow(player)
    this.cameras.main.ignore([scoreText])

    UICam = this.cameras.add(0, 0, 3200, 600)
    UICam.ignore([sky, platforms, player, stars])
}

//function shootBomb(bullets, platforms) {

//}

//function shootBomb(bullets, bomb) {
//player.setTint(0xff0000);
//player.anims.play('turn');
//gameOver = true;
//}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000)
    gameOver = true;
    this.scene.restart()
    rifleAmmo = 15
    scoreText.setText(player.weapon + 'Ammo: ' + rifleAmmo)

}

function shootWall(bullet) {
    bullet.lifespan = 0
}

function shootBomb(bullet, bomb) {
    console.log("ici")
    bullet.lifespan = 0
    bomb.disableBody(true, true)
}

function collectStar(player, star) {
    star.disableBody(true, true); // l’étoile disparaît
    rifleAmmo += 10; //augmente le score de 10
    scoreText.setText(player.weapon + 'Ammo: ' + rifleAmmo); //met à jour l’affichage du score 
    if (stars.countActive(true) === 0) { // si toutes les étoiles sont prises
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        }); // on les affiche toutes de nouveau
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(400, 400);
        // si le perso est à gauche de l’écran, on met une bombe à droite
        // si non, on la met à gauche de l’écran
        var bomb = bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
        bomb.allowGravity = false //elle n’est pas soumise à la gravité
        UICam.ignore([bomb])
    }
}

function update(time, delta) {

    if (Phaser.Input.Keyboard.DownDuration(keyZ, 100000)) {
        player.setVelocityY(-playerSpeed)
        player.moving = true
        player.anims.play('moving', true)
    } else if (Phaser.Input.Keyboard.DownDuration(keyS, 100000)) {
        player.setVelocityY(playerSpeed)
        player.anims.play('moving', true)
        player.moving = true
    } else {
        player.setVelocityY(0)
        player.moving = false
    }
    if (Phaser.Input.Keyboard.DownDuration(keyD, 100000)) {
        player.setVelocityX(playerSpeed)
        player.anims.play('moving', true)
        player.moving = true
    } else if (Phaser.Input.Keyboard.DownDuration(keyQ, 100000)) {
        player.setVelocityX(-playerSpeed)
        player.anims.play('moving', true)
        player.moving = true
    } else {
        player.setVelocityX(0)
        player.moving = false
    }
    //console.log(player, player.velocityX, player.velocityY)
    if (player.moving == false) {
        console.log("IDDLE")
        player.anims.play('iddle', true)
    }
    if ((isDown && time > lastFired)) {
        var bullet = bullets.get();
        UICam.ignore([bullet])

        if (bullet && player.weapon.currentAmmo > 0) {
            bullet.fire(mouseX, mouseY);
            rifleAmmo--;
            scoreText.setText(player.weapon + 'Ammo: ' + rifleAmmo); //met à jour l’affichage du score 
            lastFired = time + player.weapon.cadence; //duréé de la rafale
        }
    }

    player.xcamera = Math.floor(this.cameras.main.worldView.x)
    player.ycamera = Math.floor(this.cameras.main.worldView.y)
    player.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, player.x - player.xcamera, player.y - player.ycamera) - Math.PI / 2)


    /*if (Phaser.Input.Keyboard.JustDown( doubleJump ) && player.body.touching.down){
        //si touche haut appuyée ET que le perso touche le sol
        player.setVelocityY(-330); //alors vitesse verticale négative
        //(on saute)
    if(Phaser.Input.Keyboard.JustDown( doubleJump ) && !player.body.touching.down)  {
        player.setVelocityY(-330);
    } 
    }*/
}