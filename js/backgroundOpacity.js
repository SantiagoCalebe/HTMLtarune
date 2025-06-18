document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const backgroundGif = document.getElementById('backgroundGif');

  if (toggleBtn && backgroundGif) {
    let isBackgroundVisible = true;

    const labelSpan = toggleBtn.querySelector('.label');

    toggleBtn.addEventListener('click', () => {
      if (isBackgroundVisible) {
        backgroundGif.style.display = 'none';
        labelSpan.textContent = 'Show Background';
      } else {
        backgroundGif.style.display = 'block';
        labelSpan.textContent = 'Hide Background';
      }
      isBackgroundVisible = !isBackgroundVisible;
    });
  }
});
