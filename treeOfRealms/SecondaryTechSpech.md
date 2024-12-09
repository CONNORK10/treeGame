# Tree of Realms Tech Spec

## Technology Stack

### 1. Phaser - [https://phaser.io/](https://phaser.io/)

- : JavaScript Game framework with convenient GUI and camera features needed for the game

### 2. Godot - [https://godotengine.org/](https://godotengine.org/)

- : Full-fledged open-source lightweight game engine with support for HTML5 Web exports

### Misc - JavaScript Terrain Generation Tech

- : Math libraries are required if using Phaser to generate terrain with noise
- Perlin Noise Generator: [https://github.com/leodeslf/perlin-noise?tab=readme-ov-file](https://github.com/leodeslf/perlin-noise?tab=readme-ov-file)
- Cubic Spline Interpolator: [https://www.npmjs.com/package/cubic-spline](https://www.npmjs.com/package/cubic-spline)

## Architecture

### 1. Game Manager (P0)

- **Variables**
    - `level: int` - Tracks the current level
    - `score: int` - Player’s score
    - `health: double` - Player’s health remaining
    - `isGameOver: boolean` - Indicates if the game is over
    - `player: PlayerController` - Instance of the PlayerController object
    - `enemies: List<Enemy>`  - List of enemy instances in the game
    - `items: List<Item>` - List of item instances
    - `terrain: TerrainGenerator` - Instance of the TerrainGenerator object
- **Methods**
    - `initializeGame`
        - initializes the first level: setting the proper variables and loading the proper objects
    - `incrementLevel`
        - unloads the current level and generates the next one using `TerrainGenerator`
    - `endGame`
        - saves the player’s high score into the leaderboard and loads
    - `resetGame`
        - resets the game and loads the main menu
    - `toggleGamePause`
        - toggles wether the game is paused or playing
    - `updateUI`
        - updates the values for every instance of GUIElement
    - `tickGameplay`
        - calls `updateUI`  and `move` for both PlayerController and Enemy instances

### 2. PlayerController (P0)

- **Variables**
    - `playerHealth: double` - current health of the player
    - `currentItem: Item` - item loaded in player’s hands
    - `speed: double` - coefficient of player movement speed
    - `jumpCoefficient: double` - coefficient of player jump force
    - `canFly: boolean` - boolean representing whether or not the player has the ability to fly
    - `flightGuage: double` - current flight fuel of the player
- **Methods**
    - `move` - updates the position of the enemy
    - `enableFlight` - puts the player into flight mode and begins depleting `flightGuage`
    - `useItem` - calls `useItem` on the current item

### 3. Enemy (P1)
- **on the condition that the movment is very simple or nonexistant**
- **Variables**
    - `enemyHealth: double`  - current health of the enemy
    - `damage: double` - weapon damage of enemy
    - `enemyWeapon: Item` - Item object representing the enemy’s weapon
    - `speed: double` - coefficient of enemy movement speed
    - `jumpCoefficient: double` - coefficient of enemy jump force
    - `canFly: boolean` - boolean representing wether or not the enemy has the ability to fly
    - `flightGuage: double` - current flight fuel of the enemy
- **Methods**
    - `generateEnemy` - generates a new enemy
    - `pathfind` - finds the most optimal path to the player
    - `move` - updates the position of the enemy
    - `attack` - calls `useItem` on enemyWeapon

### 4. TerrainGenerator (P0 / P2)
- ** P0 becasue terrain is needed, P2 because complex/generated terrain is not needed**

Generates a curve representing the game’s terrain by generating 1-D noise, sampling points of the noise, and generating a curve of the points using interpolation.

- **Variables**
    - `amplitude: double`  - Amplitude of generated Perlin Noise
    - `scale: double` - Variation density of generated Perlin Noise
    - `sampleRate: double` - Rate of sampled point positions of Perlin Noise
- **Methods**
    - `sampleNoise` - Generates a Perlin noise using ([https://github.com/leodeslf/perlin-noise?tab=readme-ov-file](https://github.com/leodeslf/perlin-noise?tab=readme-ov-file)) and samples point positions of the noise constrained to `sampleRate`
    - `splineInterpolate` - Uses Spline Interpolation ([https://www.npmjs.com/package/cubic-spline](https://www.npmjs.com/package/cubic-spline)) to generate a curve that will represent the game’s terrain

### 5. Inventory (P2)

- **Variables**
    - `itemList: Item[][]` - 2d array representing player inventory
- **Methods**
    - `getItem` - loads the specified item from `itemList` and loads it with the player

### 6. GUIElement (P2)

- **Variables**
    - `position: Point` - center of the GUI Element
    - `xScale: double` - size of the element on the x-axis
    - `yScale: double` - size of the element on the y-axis
    - `uiText: String` - text displayed on a given element
- **Methods**
    - `loadElements` - loads all instances of GUIElement

### 7. Item (P1)
- **on the condition that there are no animations and only 1-3 items**

- **Variables**
    - `isConsumable: boolean` - signifies wether or not an item is consumable
    - `isProjectile: boolean` - signifies wether or not an item is a projectile
    - `isMelee: boolean` - signifies wetheror not an item is a melee
    - `cooldownRate: double` - constrains how often the user can use the item if not consumable
- **Methods**
    - `useItem` - consumes, shoots, or slashes item constrained by `cooldownRate`

## Data Model - Figma

[https://www.figma.com/board/NVOheDwwvEsDn6Hp50extU/Welcome-to-FigJam?node-id=0-1&node-type=canvas&t=43xQh79o95K2KwFy-0](https://www.figma.com/board/NVOheDwwvEsDn6Hp50extU/Welcome-to-FigJam?node-id=0-1&node-type=canvas&t=43xQh79o95K2KwFy-0)

[https://embed.figma.com/board/NVOheDwwvEsDn6Hp50extU/Welcome-to-FigJam?node-id=0-1&node-type=canvas&t=43xQh79o95K2KwFy-0&embed-host=notion&footer=false&theme=system](https://embed.figma.com/board/NVOheDwwvEsDn6Hp50extU/Welcome-to-FigJam?node-id=0-1&node-type=canvas&t=43xQh79o95K2KwFy-0&embed-host=notion&footer=false&theme=system)