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
    player.body.setCollideWorldBounds(true);
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

    // Create minions
    spawnMinions(this);

    // Input handling - WASD
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    mousePointer = this.input.activePointer;
}

function createPlatforms(scene) {
    // Create multiple platforms closer together and at more jumpable heights
    const platformColors = [0x34495e, 0x2c3e50, 0x7f8c8d];
    
    // Platform 1 - lower and wider
    const platform1 = scene.add.rectangle(250, 450, 250, 20, platformColors[0]);
    scene.physics.add.existing(platform1, true);
    platforms.push(platform1);

    // Platform 2 - mid height
    const platform2 = scene.add.rectangle(600, 350, 250, 20, platformColors[1]);
    scene.physics.add.existing(platform2, true);
    platforms.push(platform2);

    // Platform 3 - higher
    const platform3 = scene.add.rectangle(250, 250, 250, 20, platformColors[2]);
    scene.physics.add.existing(platform3, true);
    platforms.push(platform3);
}

function createStairs(scene) {
    // Create stairs connecting ground, platforms, and providing multiple routes
    const stairColor = 0x95a5a6;

    // Stairs from ground to first platform (angled and wider)
    const stair1 = scene.add.rectangle(150, 490, 150, 30, stairColor);
    stair1.setRotation(Math.PI / 4);
    scene.physics.add.existing(stair1, true);
    stairs.push(stair1);

    // Stairs connecting first platform to second platform
    const stair2 = scene.add.rectangle(425, 400, 150, 30, stairColor);
    stair2.setRotation(Math.PI / 4);
    scene.physics.add.existing(stair2, true);
    stairs.push(stair2);

    // Alternative stairs route from ground to second platform
    const stair3 = scene.add.rectangle(500, 425, 150, 30, stairColor);
    stair3.setRotation(Math.PI / 4);
    scene.physics.add.existing(stair3, true);
    stairs.push(stair3);

    // Stairs connecting second platform to third platform
    const stair4 = scene.add.rectangle(375, 325, 150, 30, stairColor);
    stair4.setRotation(Math.PI / 4);
    scene.physics.add.existing(stair4, true);
    stairs.push(stair4);
}



function handleStairInteraction(player, stair) {
    // Allow vertical movement on stairs
    if (cursors.up.isDown) {
        player.body.setVelocityY(-200);
        player.body.setGravityY(0);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(200);
        player.body.setGravityY(0);
    } else {
        player.body.setGravityY(300);
    }
}

function update() {
    // Movement controls - WASD
    if (cursors.left.isDown) {
        player.body.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(200);
    } else {
        player.body.setVelocityX(0);
    }
    // Improved jump control with multiple surface detection
    const canJump = player.body.touching.down || 
        platforms.some(platform => Phaser.Geom.Intersects.RectangleToRectangle(
            player.getBounds(), 
            platform.getBounds()
        )) ||
        stairs.some(stair => Phaser.Geom.Intersects.RectangleToRectangle(
            player.getBounds(), 
            stair.getBounds()
        ));
        if (cursors.up.isDown && canJump) {
            player.body.setVelocityY(-330);
        }

    // Jump control with improved detection
    if (cursors.up.isDown && (player.body.touching.down || 
        platforms.some(platform => Phaser.Geom.Intersects.RectangleToRectangle(
            player.getBounds(), 
            platform.getBounds()
        )))) {
        player.body.setVelocityY(-330);
    }

    // Basic attack on mouse click
    if (mousePointer.isDown) {
        performAttack(this);
    }

    // Minion movement and damage
    updateMinionMovement(this);

    // Check level completion
    checkLevelCompletion(this);

    // Update health text and health bar
    healthText.setText(`Health: ${playerHealth}`);
    healthBar.width = Math.max(0, (playerHealth / 100) * 200);

    // Update level text
    levelText.setText(`Level: ${currentLevel}`);

    // Check game over
    if (playerHealth <= 0) {
        alert('Game Over!');
        playerHealth = 100;
        this.scene.restart();
    }
}

function spawnMinions(scene) {
    // Increase minion count and spread them out more
    const minionCount = Phaser.Math.Between(10, 25);
    for (let i = 0; i < minionCount; i++) {
        // Spread minions across different platforms and ground
        const platformOrGround = Phaser.Math.RND.pick([...platforms, levelBounds]);
        
        // Random x position near the platform
        const x = Phaser.Math.Between(
            platformOrGround.x - platformOrGround.width / 2, 
            platformOrGround.x + platformOrGround.width / 2
        );
        
        // Y position on or just above the platform
        const y = platformOrGround.y - 30;

        const minion = scene.add.circle(x, y, 15, 0xe74c3c);
        scene.physics.add.existing(minion);
        minion.body.setCollideWorldBounds(true);
        minion.body.setGravityY(300);
        
        // Add collisions
        scene.physics.add.collider(minion, levelBounds);
        platforms.forEach(platform => {
            scene.physics.add.collider(minion, platform);
        });
        
        // Add random movement properties
        minion.movementTimer = 0;
        minion.movementDirection = Phaser.Math.RND.sign();
        
        minions.push(minion);
    }
}

function updateMinionMovement(scene) {
    // Increment damage timer
    damageTimer++;

    minions.forEach(minion => {
        // Add random movement
        minion.movementTimer++;
        
        if (minion.movementTimer >= 60) {
            // Randomly change direction every second
            minion.movementDirection = Phaser.Math.RND.sign();
            minion.movementTimer = 0;
        }

        // Move with some randomness
        const speed = 100 * minion.movementDirection;
        minion.body.setVelocityX(speed);

        // Periodically try to move towards player with reduced aggression
        if (Phaser.Math.RND.frac() < 0.3) {
            scene.physics.moveToObject(minion, player, 50);
        }

        // Damage player periodically
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

    // Reset damage timer
    if (damageTimer >= 60) {
        damageTimer = 0;
    }
}

function performAttack(scene) {
    minions.forEach((minion, index) => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y, 
            minion.x, minion.y
        );

        if (distance < 50) {
            // Remove minion on attack
            minion.destroy();
            minions.splice(index, 1);
        }
    });
}

function checkLevelCompletion(scene) {
    if (minions.length === 0 && !levelComplete) {
        levelComplete = true;
        currentLevel++;

        // Add door
        door = scene.add.rectangle(750, 520, 50, 80, 0x2ecc71);
        
        if (currentLevel <= 5) {
            // Prepare next level
            setTimeout(() => {
                // Destroy existing minions
                minions.forEach(m => m.destroy());
                minions = []; // Clear the minions array

                // Destroy existing platforms and stairs
                platforms.forEach(p => p.destroy());
                platforms = [];
                stairs.forEach(s => s.destroy());
                stairs = [];

                // Destroy the door
                if (door) {
                    door.destroy();
                }

                // Reset player position
                player.x = 100;
                player.y = 500;

                // Create new platforms and stairs
                createPlatforms(scene);
                createStairs(scene);

                // Spawn new minions
                spawnMinions(scene);
                levelComplete = false;
            }, 2000);
        } else {
            // Game completed
            alert('Congratulations! You completed all levels!');
        }
    }
}