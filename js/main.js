// Nav mega dropdown hover logic
document.addEventListener('DOMContentLoaded', () => {
  // Smooth image placeholder fallback
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
    });
  });

  // Filter chips toggle
  document.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.toggle('active');
    });
  });

  // Grid toggle
  const toggleBtns = document.querySelectorAll('.grid-toggle');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Filter group collapse
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.parentElement;
      const content = group.querySelector('.filter-group-content');
      if (content) content.style.display = content.style.display === 'none' ? '' : 'none';
    });
  });

  // Wishlist toggle
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
      btn.style.color = btn.textContent === '♥' ? '#e53e3e' : '#999';
    });
  });

  // Quick add button feedback
  document.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const orig = btn.textContent;
      btn.textContent = '✓ Added!';
      btn.style.background = 'rgba(45,179,74,0.9)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
      }, 1500);
    });
  });
});
