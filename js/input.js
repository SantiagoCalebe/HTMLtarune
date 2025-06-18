export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export function setupInputListeners() {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
        keys.up = true;
        break;
      case "ArrowDown":
      case "s":
        keys.down = true;
        break;
      case "ArrowLeft":
      case "a":
        keys.left = true;
        break;
      case "ArrowRight":
      case "d":
        keys.right = true;
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
        keys.up = false;
        break;
      case "ArrowDown":
      case "s":
        keys.down = false;
        break;
      case "ArrowLeft":
      case "a":
        keys.left = false;
        break;
      case "ArrowRight":
      case "d":
        keys.right = false;
        break;
    }
  });
}
