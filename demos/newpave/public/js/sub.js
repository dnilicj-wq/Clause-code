// Service and area pages: glass header, mobile dock, year.
(() => {
  const hd = document.getElementById('hd'), dock = document.getElementById('dock'), yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
  const on = () => { const y = scrollY; hd.classList.toggle('glass', y > 40); dock.classList.toggle('show', y > innerHeight * .5); };
  addEventListener('scroll', on, { passive: true }); on();
})();
