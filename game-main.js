var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
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
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('perso', 'assets/perso.png', {
        frameWidth: 32,
        frameHeight: 48
    })
}

/*function create(){
  this.add.image(400, 300, 'sky');
  this.add.image(400, 300, 'star');

  //game.tKey = game.input.keyboard.addKey( 't')
}*/

var platforms;
var light
var player;
var cursors;
var stars;
var ammo;
ammo = 10
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

var playerSpeed
playerSpeed = 200
var maxShoot
maxShoot = 50
var lifeShoot
lifeShoot = 1000
var cadenceShoot
cadenceShoot = 100




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

function create() {

    let sky = this.add.image(400, 300, 'sky')

    const spectrum = Phaser.Display.Color.ColorSpectrum(128)
    let radius = 128
    let intensity = 1
    let colorIndex = 12
    light = this.add.pointlight(400, 300, 0, radius, intensity)
    let color = spectrum[colorIndex]
    light.color.setTo(color.r, color.g, color.b)

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    player = this.physics.add.sprite(100, 450, 'perso');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('perso', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'perso',
            frame: 4
        }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('perso', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });
    cursors = this.input.keyboard.createCursorKeys();
    scoreText = this.add.text(16, 16, 'ammo : ' + ammo, {
        fontSize: '32px',
        fill: '#000'
    });
    //affiche un texte à l’écran, pour le score
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
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bomb');

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

            var angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);

            this.setRotation(angle);

            this.incX = Math.cos(angle);
            this.incY = Math.sin(angle);

            this.lifespan = lifeShoot; //porté tir
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
        maxSize: maxShoot, //munition max afficher a l'ecran
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

    });

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
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
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
    ammo += 10; //augmente le score de 10
    scoreText.setText('Ammo: ' + ammo); //met à jour l’affichage du score 
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
    }
}

function update(time, delta) {

    // Update light
    light.x = player.x
    light.y = player.y

    if (Phaser.Input.Keyboard.DownDuration(keyZ, 100000)) {
        player.setVelocityY(-playerSpeed);
        player.anims.play('right', true);
    } else if (Phaser.Input.Keyboard.DownDuration(keyS, 100000)) {
        player.setVelocityY(playerSpeed);
        player.anims.play('right', true);
    } else {
        player.setVelocityY(0);
        player.anims.play('turn');
    }
    if (Phaser.Input.Keyboard.DownDuration(keyD, 100000)) {
        player.setVelocityX(playerSpeed);
        player.anims.play('right', true);
    } else if (Phaser.Input.Keyboard.DownDuration(keyQ, 100000)) {
        player.setVelocityX(-playerSpeed);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if ((isDown && time > lastFired)) {
        var bullet = bullets.get();

        if (bullet && ammo > 0) {
            bullet.fire(mouseX, mouseY);
            ammo--;
            scoreText.setText('Ammo: ' + ammo); //met à jour l’affichage du score 
            lastFired = time + cadenceShoot; //duréé de la rafale
        }
    }

    player.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, player.x, player.y) - Math.PI / 2);


    /*if (Phaser.Input.Keyboard.JustDown( doubleJump ) && player.body.touching.down){
        //si touche haut appuyée ET que le perso touche le sol
        player.setVelocityY(-330); //alors vitesse verticale négative
        //(on saute)
    if(Phaser.Input.Keyboard.JustDown( doubleJump ) && !player.body.touching.down)  {
        player.setVelocityY(-330);
    } 
    }*/
}