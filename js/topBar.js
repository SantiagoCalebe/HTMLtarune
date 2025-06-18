const topBar = document.getElementById('topBar');
const about = document.getElementById('about');
const backgroundGif = document.getElementById('backgroundGif');

window.addEventListener('mousemove', (e) => {
  if (e.clientY <= 50) {
    topBar.classList.add('show');
  } else {
    topBar.classList.remove('show');
  }
});

document.getElementById('about').addEventListener('click', () => {
  window.open('pages/about.html', '_blank');
});

window.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 10; 
  const y = (e.clientY / window.innerHeight - 0.5) * 10;

  const posX = 50 + x;
  const posY = 50 + y;

  backgroundGif.style.backgroundPosition = `${posX}% ${posY}%`;
});
