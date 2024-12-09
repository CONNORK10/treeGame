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
let levelComplete = false;
let levelBounds;
let door;
let playerHealth = 100;
let healthText;
let damageTimer = 0;

function preload() {
    // No preloading needed for basic shapes
}

function create() {
    // Create level bounds
    levelBounds = this.add.rectangle(400, 550, 800, 100, 0x8B4513);
    this.physics.add.existing(levelBounds, true);

    // Create platforms
    createPlatforms(this);

    // Create player
    player = this.add.circle(100, 500, 20, 0x3498db);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    player.body.setGravityY(300);

    // Add collision with level ground and platforms
    this.physics.add.collider(player, levelBounds);
    platforms.forEach(platform => {
        this.physics.add.collider(player, platform);
    });

    // Health text
    healthText = this.add.text(16, 16, 'Health: 100', { 
        fontSize: '24px', 
        fill: '#ffffff' 
    });

    // Create minions
    spawnMinions(this);

    // Input handling
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.SPACE,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    mousePointer = this.input.activePointer;
}

function createPlatforms(scene) {
    // Create multiple platforms at different heights and positions
    const platformColors = [0x34495e, 0x2c3e50, 0x7f8c8d];
    
    // Platform 1
    const platform1 = scene.add.rectangle(250, 400, 200, 20, platformColors[0]);
    scene.physics.add.existing(platform1, true);
    platforms.push(platform1);

    // Platform 2
    const platform2 = scene.add.rectangle(600, 300, 180, 20, platformColors[1]);
    scene.physics.add.existing(platform2, true);
    platforms.push(platform2);

    // Platform 3
    const platform3 = scene.add.rectangle(400, 200, 220, 20, platformColors[2]);
    scene.physics.add.existing(platform3, true);
    platforms.push(platform3);
}

function update() {
    // Movement controls
    if (cursors.left.isDown) {
        player.body.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(200);
    } else {
        player.body.setVelocityX(0);
    }

    // Jump control
    if (cursors.up.isDown && (player.body.touching.down || platforms.some(p => player.body.touching.down))) {
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

    // Update health text
    healthText.setText(`Health: ${playerHealth}`);

    // Check game over
    if (playerHealth <= 0) {
        alert('Game Over!');
        playerHealth = 100;
        this.scene.restart();
    }
}

function spawnMinions(scene) {
    const minionCount = Phaser.Math.Between(5, 15);
    for (let i = 0; i < minionCount; i++) {
        const x = Phaser.Math.Between(200, 700);
        const minion = scene.add.circle(x, 500, 15, 0xe74c3c);
        scene.physics.add.existing(minion);
        minion.body.setCollideWorldBounds(true);
        minion.body.setGravityY(300);
        scene.physics.add.collider(minion, levelBounds);
        platforms.forEach(platform => {
            scene.physics.add.collider(minion, platform);
        });
        minions.push(minion);
    }
}

function updateMinionMovement(scene) {
    // Increment damage timer
    damageTimer++;

    minions.forEach(minion => {
        // Calculate direction to player
        const angle = Phaser.Math.Angle.Between(minion.x, minion.y, player.x, player.y);
        
        // Move towards player
        const speed = 100;
        scene.physics.moveToObject(minion, player, speed);

        // Damage player periodically
        if (damageTimer >= 60) { // About once per second
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

                // Destroy existing platforms
                platforms.forEach(p => p.destroy());
                platforms = [];

                // Destroy the door
                if (door) {
                    door.destroy();
                }

                // Reset player position
                player.x = 100;
                player.y = 500;

                // Create new platforms
                createPlatforms(scene);

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