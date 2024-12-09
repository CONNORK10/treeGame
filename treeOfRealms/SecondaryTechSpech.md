## Technical Specification

---

**Technologies Used:**  

1. **Frontend Framework:**  
   - [Phaser.js 3.55.2](https://phaser.io/) – a lightweight HTML5 game framework for rendering, physics, and input handling.

2. **Languages:**  
   - **HTML5:** Basic webpage structure.  
   - **CSS3:** Styling for the game container.  
   - **JavaScript (ES6):** Game logic, physics, and interactivity.  

3. **Hosting Requirements:**  
   - Runs directly in a browser without a server-side backend.  

---

**Game Components:**  

1. **Player:**  
   - **Shape:** Circle with a radius of 20.  
   - **Physics:**  
     - Gravity: Y-axis (300 units).  
     - Collision with world bounds and ground.  
   - **Input Handling:**  
     - Keyboard for movement (A, D, SPACE).  
     - Mouse click for attacks.  

2. **Minions:**  
   - **Shape:** Circle with a radius of 15.  
   - **Physics:**  
     - Gravity: Y-axis (300 units).  
     - Collision with world bounds and ground.  

3. **Level Bounds:**  
   - **Shape:** Rectangle to represent the ground.  
   - **Physics:**  
     - Static object to handle collisions with the player and minions.  

4. **Door (Level Transition):**  
   - **Shape:** Rectangle with static properties.  

---

**Physics Configuration:**  
- **Engine:** Arcade Physics (default in Phaser).  
- **Gravity:** Applied to all dynamic objects (player, minions).  
- **Collision Detection:**  
  - Ground, player, and minions interact via collision constraints.

---

**Input Handling:**  
- Keyboard: Phaser's `keyboard.addKeys` for movement.  
- Mouse: Phaser's `activePointer` for attack actions.  

---

**Game Logic:**  

1. **Initialization:**  
   - Set up the game configuration (canvas size, physics engine, scenes).  

2. **Level Setup:**  
   - Spawn minions randomly within bounds.  
   - Reset player's position and game state.  

3. **Update Loop:**  
   - Process user inputs (movement and attack).  
   - Check for level completion (no minions left).  
   - Transition to the next level or end the game.  

4. **Collision Detection:**  
   - Player and ground.  
   - Player and minions (attacks).  
   - Minions and ground.  

5. **Scaling Difficulty:**  
   - Increase minion count with each level.  

---

**Performance Considerations:**  
- Efficient memory handling by destroying unused game objects (minions) at level transitions.  
- Optimized collision and physics calculations using Phaser’s built-in methods.  

---

**Future Improvements:**  
- Add player health and failure conditions.  
- Introduce animations and sound effects.  
- Add power-ups or weapons for advanced combat mechanics.  
- Implement a scoring system to track player performance.  

---

This structure ensures the game is simple, playable, and extensible for future development.
"""

with open("/mnt/data/TechSpec.md", "w") as techspec_file:
    techspec_file.write(techspec_content)