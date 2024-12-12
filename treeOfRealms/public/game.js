const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let spaceKey;
let mousePointer;
let currentLevel = 1;
let minions = [];
let platforms = [];
let stairs = [];
let levelComplete = false;
let levelBounds;
let door;
let playerHealth = 100;
let healthText;
let levelText;
let healthBar;
let damageTimer = 0;
let weaponMode = 'melee';
let weaponText;
let projectiles;
let lastShotTime = 0;
let shootingCooldown = 250;
let switchKey;

function preload() {
    // No preloading needed for basic shapes
}

function create() {
    // Create level bounds
    levelBounds = this.add.rectangle(400, 550, 800, 100, 0x8B4513);
    this.physics.add.existing(levelBounds, true);

    // Create platforms and stairs
    createPlatforms(this);
    createStairs(this);

    // Create player
    player = this.add.circle(100, 500, 20, 0x3498db);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(false);
    player.body.setGravityY(300);

    // Add collision with level ground, platforms, and stairs
    this.physics.add.collider(player, levelBounds);
    platforms.forEach(platform => {
        this.physics.add.collider(player, platform);
    });
    stairs.forEach(stair => {
        this.physics.add.overlap(player, stair, handleStairInteraction, null, this);
    });

    // Health bar and text
    healthBar = this.add.rectangle(10, 10, 200, 20, 0x2ecc71);
    healthBar.setOrigin(0, 0);
    healthBar.setScrollFactor(0);

    healthText = this.add.text(10, 35, 'Health: 100', { 
        fontSize: '18px', 
        fill: '#ffffff' 
    });
    healthText.setScrollFactor(0);

    // Level text
    levelText = this.add.text(10, 60, 'Level: 1', { 
        fontSize: '18px', 
        fill: '#ffffff' 
    });
    levelText.setScrollFactor(0);

    // Weapon text
    weaponText = this.add.text(10, 85, 'Weapon: Melee', { 
        fontSize: '18px', 
        fill: '#ffffff' 
    });
    weaponText.setScrollFactor(0);

    // Create projectiles group
    projectiles = this.add.group();

    // Create minions
    spawnMinions(this);

    // Input handling - WASD and Space
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    switchKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    mousePointer = this.input.activePointer;
}

function createPlatforms(scene) {
    const platformColors = [0x34495e, 0x2c3e50, 0x7f8c8d];
    
    const platform1 = scene.add.rectangle(250, 450, 250, 20, platformColors[0]);
    scene.physics.add.existing(platform1, true);
    platforms.push(platform1);

    const platform2 = scene.add.rectangle(600, 350, 250, 20, platformColors[1]);
    scene.physics.add.existing(platform2, true);
    platforms.push(platform2);

    const platform3 = scene.add.rectangle(250, 250, 250, 20, platformColors[2]);
    scene.physics.add.existing(platform3, true);
    platforms.push(platform3);
}

function createStairs(scene) {
    const stairColor = 0x95a5a6;
    const stairWidth = 200;
    const stairHeight = 40;

    function createAngledStair(x, y, angle) {
        const stairGroup = scene.add.group();

        const mainStair = scene.add.rectangle(x, y, stairWidth, stairHeight, stairColor);
        mainStair.setRotation(angle);
        scene.physics.add.existing(mainStair, true);
        
        const borderStair = scene.add.rectangle(x, y, stairWidth + 10, stairHeight + 10, 0x7f8c8d);
        borderStair.setRotation(angle);
        borderStair.setAlpha(0.5);

        stairGroup.add(mainStair);
        stairGroup.add(borderStair);

        stairs.push(mainStair);
        return mainStair;
    }

    createAngledStair(150, 490, Math.PI / 4);
    createAngledStair(425, 400, Math.PI / 4);
    createAngledStair(500, 425, Math.PI / 4);
    createAngledStair(375, 325, Math.PI / 4);
}

function handleStairInteraction(player, stair) {
    if (cursors.up.isDown || spaceKey.isDown) {
        player.body.setVelocityY(-200);
        player.body.setGravityY(0);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(200);
        player.body.setGravityY(0);
    } else {
        player.body.setGravityY(300);
    }
}

function createProjectile(scene, x, y, direction) {
    const projectile = scene.add.circle(x, y, 5, 0xffff00);
    scene.physics.add.existing(projectile);
    
    const speed = 400;
    const angle = Math.atan2(direction.y, direction.x);
    
    projectile.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
    );

    minions.forEach(minion => {
        scene.physics.add.overlap(projectile, minion, (proj, min) => {
            proj.destroy();
            min.destroy();
            minions = minions.filter(m => m !== min);
        });
    });

    platforms.forEach(platform => {
        scene.physics.add.collider(projectile, platform, (proj) => {
            proj.destroy();
        });
    });

    scene.time.delayedCall(1000, () => {
        if (projectile.active) {
            projectile.destroy();
        }
    });

    projectiles.add(projectile);
    return projectile;
}

function handleVerticalWrapping(player) {
    const buffer = 30;

    if (player.y > config.height + buffer) {
        player.y = -buffer;
        const currentVelocityX = player.body.velocity.x;
        player.body.reset(player.x, -buffer);
        player.body.setVelocityX(currentVelocityX);
    } else if (player.y < -buffer) {
        player.y = config.height + buffer;
        const currentVelocityX = player.body.velocity.x;
        player.body.reset(player.x, config.height + buffer);
        player.body.setVelocityX(currentVelocityX);
    }
}

function performAttack(scene) {
    const currentTime = scene.time.now;

    if (weaponMode === 'melee') {
        minions.forEach((minion, index) => {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y, 
                minion.x, minion.y
            );

            if (distance < 50) {
                minion.destroy();
                minions.splice(index, 1);
            }
        });
    } else if (weaponMode === 'gun' && currentTime - lastShotTime >= shootingCooldown) {
        const direction = {
            x: mousePointer.x + scene.cameras.main.scrollX - player.x,
            y: mousePointer.y + scene.cameras.main.scrollY - player.y
        };
        
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;

        createProjectile(scene, player.x, player.y, direction);
        lastShotTime = currentTime;
    }
}

function update() {
    handleVerticalWrapping(player);

    if (cursors.left.isDown) {
        player.body.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(200);
    } else {
        player.body.setVelocityX(0);
    }

    const canJump = player.body.touching.down || 
        platforms.some(platform => Phaser.Geom.Intersects.RectangleToRectangle(
            player.getBounds(), 
            platform.getBounds()
        )) ||
        stairs.some(stair => Phaser.Geom.Intersects.RectangleToRectangle(
            player.getBounds(), 
            stair.getBounds()
        ));

    if ((cursors.up.isDown || spaceKey.isDown) && canJump) {
        player.body.setVelocityY(-330);
    }

    if (mousePointer.isDown) {
        performAttack(this);
    }

    if (Phaser.Input.Keyboard.JustDown(switchKey)) {
        weaponMode = weaponMode === 'melee' ? 'gun' : 'melee';
        weaponText.setText(`Weapon: ${weaponMode.charAt(0).toUpperCase() + weaponMode.slice(1)}`);
    }

    projectiles.getChildren().forEach(projectile => {
        if (projectile.y > config.height + 30) {
            projectile.y = -30;
        } else if (projectile.y < -30) {
            projectile.y = config.height + 30;
        }
        
        if (projectile.x > config.width + 30) {
            projectile.x = -30;
        } else if (projectile.x < -30) {
            projectile.x = config.width + 30;
        }
    });

    updateMinionMovement(this);
    checkLevelCompletion(this);

    healthText.setText(`Health: ${playerHealth}`);
    healthBar.width = Math.max(0, (playerHealth / 100) * 200);
    levelText.setText(`Level: ${currentLevel}`);

    if (playerHealth <= 0) {
        alert('Game Over!');
        playerHealth = 100;
        this.scene.restart();
    }

    if (player.x > config.width) {
        player.x = 0;
    } else if (player.x < 0) {
        player.x = config.width;
    }
}

function spawnMinions(scene) {
    const minionCount = Phaser.Math.Between(10, 25);
    for (let i = 0; i < minionCount; i++) {
        const platformOrGround = Phaser.Math.RND.pick([...platforms, levelBounds]);
        
        const x = Phaser.Math.Between(
            platformOrGround.x - platformOrGround.width / 2, 
            platformOrGround.x + platformOrGround.width / 2
        );
        
        const y = platformOrGround.y - 30;

        const minion = scene.add.circle(x, y, 15, 0xe74c3c);
        scene.physics.add.existing(minion);
        minion.body.setCollideWorldBounds(true);
        minion.body.setGravityY(300);
        
        scene.physics.add.collider(minion, levelBounds);
        platforms.forEach(platform => {
            scene.physics.add.collider(minion, platform);
        });
        
        minion.movementTimer = 0;
        minion.movementDirection = Phaser.Math.RND.sign();
        
        minions.push(minion);
    }
}

function updateMinionMovement(scene) {
    damageTimer++;

    minions.forEach(minion => {
        minion.movementTimer++;
        
        if (minion.movementTimer >= 60) {
            minion.movementDirection = Phaser.Math.RND.sign();
            minion.movementTimer = 0;
        }

        const speed = 100 * minion.movementDirection;
        minion.body.setVelocityX(speed);

        if (Phaser.Math.RND.frac() < 0.3) {
            scene.physics.moveToObject(minion, player, 50);
        }

        if (damageTimer >= 60) {
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y, 
                minion.x, minion.y
            );

            if (distance < 30) {
                playerHealth -= 5;
            }
        }
    });

    if (damageTimer >= 60) {
        damageTimer = 0;
    }
}

function checkLevelCompletion(scene) {
    if (minions.length === 0 && !levelComplete) {
        levelComplete = true;
        currentLevel++;

        door = scene.add.rectangle(750, 520, 50, 80, 0x2ecc71);
        
        if (currentLevel <= 5) {
            setTimeout(() => {
                minions.forEach(m => m.destroy());
                minions = [];

                platforms.forEach(p => p.destroy());
                platforms = [];
                stairs.forEach(s => s.destroy());
                stairs = [];

                if (door) {
                    door.destroy();
                }

                player.x = 100;
                player.y = 500;

                createPlatforms(scene);
                createStairs(scene);

                spawnMinions(scene);
                levelComplete = false;
            }, 2000);
        } else {
            alert('Congratulations! You completed all levels!');
        }
    }
}