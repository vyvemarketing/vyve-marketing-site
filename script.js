const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

menuButton?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'FECHAR' : 'MENU';
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = 'MENU';
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) {
    menu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = 'MENU';
    menuButton?.focus();
  }
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const clientTrack = document.querySelector('.client-track');
const clientSet = clientTrack?.querySelector('.client-set');

if (clientTrack && clientSet) {
  const duplicateSet = clientSet.cloneNode(true);
  duplicateSet.setAttribute('aria-hidden', 'true');
  duplicateSet.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
  duplicateSet.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
  clientTrack.appendChild(duplicateSet);
  clientTrack.classList.add('carousel-ready');
}

const carousel = document.querySelector('.client-carousel');
const carouselToggle = document.querySelector('.carousel-toggle');

carouselToggle?.addEventListener('click', () => {
  const paused = carousel?.classList.toggle('paused') || false;
  carouselToggle.setAttribute('aria-pressed', String(paused));
  carouselToggle.innerHTML = paused ? 'Retomar <span>▶</span>' : 'Pausar <span>Ⅱ</span>';
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const progressBar = document.querySelector('.scroll-progress span');
let scrollFrame;

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  scrollFrame = null;
};

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollProgress);
}, {passive:true});
updateScrollProgress();

const formatMetric = (value, element) => {
  const decimals = Number(element.dataset.decimals || 0);
  const prefix = element.dataset.prefix || '';
  return `${prefix}${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits:decimals,
    maximumFractionDigits:decimals
  }).format(value)}`;
};

const metricValues = document.querySelectorAll('.metric-value');

if ('IntersectionObserver' in window && !reduceMotion) {
  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.value);
      const startTime = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const elapsed = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        element.textContent = formatMetric(target * eased, element);
        if (elapsed < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      metricObserver.unobserve(element);
    });
  }, {threshold:0.45});

  metricValues.forEach((element) => metricObserver.observe(element));
}

const heroVisual = document.querySelector('.hero-visual');
if (heroVisual && window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
  heroVisual.addEventListener('pointermove', (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -14;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -14;
    heroVisual.style.setProperty('--parallax-x', `${x}px`);
    heroVisual.style.setProperty('--parallax-y', `${y}px`);
  });

  heroVisual.addEventListener('pointerleave', () => {
    heroVisual.style.setProperty('--parallax-x', '0px');
    heroVisual.style.setProperty('--parallax-y', '0px');
  });
}

const navigationLinks = [...document.querySelectorAll('.menu a')];
const navigationSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const navigationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.toggleAttribute('aria-current', active);
      });
    });
  }, {rootMargin:'-30% 0px -60% 0px'});

  navigationSections.forEach((section) => navigationObserver.observe(section));
}
