export class Character {
  constructor(name, elementId, idleSrc, hurtSrc, loseSrc) {
    this.name = name;
    this.element = document.getElementById(elementId);
    this.idleSrc = idleSrc;
    this.hurtSrc = hurtSrc;
    this.loseSrc = loseSrc;
    this.hurtTimeout = null;

    if (this.element) {
      this.element.src = this.idleSrc;
    }
  }

  setIdle() {
    if (this.element) {
      this.element.src = this.idleSrc;
    }
  }

  setHurt() {
    if (!this.element) return;

    if (this.hurtTimeout) {
      clearTimeout(this.hurtTimeout);
    }

    this.element.src = this.hurtSrc;

    this.element.classList.add("shake");

    this.element.addEventListener(
      "animationend",
      () => {
        this.element.classList.remove("shake");
      },
      { once: true }
    );

    this.hurtTimeout = setTimeout(() => {
      this.setIdle();
      this.hurtTimeout = null;
    }, 1000);
  }

  setLose() {
    if (this.element) {
      if (this.hurtTimeout) {
        clearTimeout(this.hurtTimeout);
        this.hurtTimeout = null;
      }
      this.element.src = this.loseSrc;
    }
  }
}

export const characters = {
  kris: new Character(
    "kris",
    "kris",
    "img/chr/krisIdle.gif",
    "img/chr/krisHurt.gif",
    "img/chr/krisLose.gif"
  ),
  ralsei: new Character(
    "ralsei",
    "ralsei",
    "img/chr/ralseiIdle.gif",
    "img/chr/ralseiHurt.gif",
    "img/chr/ralseiLose.gif"
  ),
  susie: new Character(
    "susie",
    "susie",
    "img/chr/susieIdle.gif",
    "img/chr/susieHurt.gif",
    "img/chr/susieLose.gif"
  ),
  dummy: new Character(
    "dummy",
    "dummy",
    "img/chr/dummy.gif",
    "img/chr/dummy.gif",
    "img/chr/dummy.gif"
   ),
};

export function initCharacters() {
  for (const char of Object.values(characters)) {
    char.setIdle();
  }
}

export function setCharacterHurt(name) {
  const char = characters[name];
  if (char) {
    char.setHurt();
  }
}

export function setAllCharactersLose() {
  for (const char of Object.values(characters)) {
    char.setLose();
  }
}
