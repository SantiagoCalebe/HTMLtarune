export function updateUI(hp, dodgesAvailable, dodgeCooldown) {
  const hpValueElement = document.getElementById("hpValue");
  const dodgeValueElement = document.getElementById("dodgeValue");

  if (hpValueElement) hpValueElement.textContent = hp;
  if (dodgeValueElement) {
    dodgeValueElement.textContent =
      dodgesAvailable +
      (dodgeCooldown > 0 ? ` (CD: ${Math.ceil(dodgeCooldown / 60)}s)` : "");
  }
}
