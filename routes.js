document.addEventListener('DOMContentLoaded', () => {
  const routes = [
    '/servicos',
    '/servicos_sem_paginacao',
    '/data',
    '/users',
    '/bpm-hem-diarias-busca-conselheiros',
    '/bpm-hem-diarias-busca-calculos',
    '/bpm-hem-diarias-tipos-conselheiros'
  ];

  const container = document.getElementById('routes-container');

  routes.forEach(route => {
    const link = document.createElement('a');
    link.href = `http://localhost:3000${route}`;
    link.textContent = route;
    link.style.display = 'block';
    container.appendChild(link);
  });
});
