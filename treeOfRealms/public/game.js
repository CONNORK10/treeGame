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
let levelComplete = false;
let levelBounds;

function preload() {
    // No preloading needed for basic shapes
}

function create() {
    // Create level bounds
    levelBounds = this.add.rectangle(400, 550, 800, 100, 0x8B4513);
    this.physics.add.existing(levelBounds, true);

    // Create player
    player = this.add.circle(100, 500, 20, 0x3498db);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    player.body.setGravityY(300);

    // Add collision with level ground
    this.physics.add.collider(player, levelBounds);

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
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.setVelocityY(-330);
    }

    // Basic attack on mouse click
    if (mousePointer.isDown) {
        performAttack(this);
    }

    // Check level completion
    checkLevelCompletion(this);
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
        minions.push(minion);
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

        // Add door or transition effect
        const door = scene.add.rectangle(750, 520, 50, 80, 0x2ecc71);
        
        if (currentLevel <= 5) {
            // Prepare next level
            setTimeout(() => {
                minions.forEach(m => m.destroy());
                spawnMinions(scene);
                levelComplete = false;
            }, 2000);
        } else {
            // Game completed
            alert('Congratulations! You completed all levels!');
        }
    }
}