# SOSO Lofts Game

This project is a 2D browser game built with the [Phaser 3](https://phaser.io/) game framework. It is inspired by the *Hollow Knight* art style and features two playable characters who explore the exterior of the SOSO Lofts building, collect items, craft a bug-catching net and hunt down three pesky bugs. Along the way you must manage your health and use healing salves to survive.

## Running locally

The game is a static web application. To run it locally:

1. Clone or download this repository.
2. Ensure the `assets/images` directory contains all sprite images.
3. Open `index.html` in a modern web browser (Chrome, Firefox, Safari) with a local web server. For example, using Python:

   ```bash
   python3 -m http.server 8000
   ```

   Then navigate to `http://localhost:8000` in your browser.

## Gameplay

* Use the **arrow keys** to move Player 1 and **WASD** to move Player 2.
* Collect the **stick** and **bag** items. Press **C** (Player 1) or **V** (Player 2) to craft a **net** when you have both items.
* Without a net, touching a bug will hurt you. You have three hearts. Pick up a **salve** to restore one heart.
* After catching all three bugs, a victory screen will appear with a simple bug scrapbook.

On touch devices, on‑screen directional buttons will appear at the bottom left of the screen.
