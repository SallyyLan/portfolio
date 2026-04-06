/* ============================================================
   EDM NEON PORTFOLIO — MAIN JS
   ============================================================ */

/* ── GSAP setup ── */
gsap.registerPlugin(ScrollTrigger);

/* ── Helpers ── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ============================================================
   PARTICLE SYSTEM (hero canvas)
   ============================================================ */
(function initParticles() {
  const canvas = $('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = ['#00f5ff', '#ff0099', '#bd00ff', '#ff6600', '#39ff14'];
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function spawnParticle() {
    return {
      x:       randomBetween(0, W),
      y:       randomBetween(H * 0.2, H),
      vx:      randomBetween(-0.4, 0.4),
      vy:      randomBetween(-0.8, -0.2),
      radius:  randomBetween(1, 2.8),
      alpha:   randomBetween(0.3, 0.9),
      color:   colors[Math.floor(Math.random() * colors.length)],
      life:    1,
      decay:   randomBetween(0.003, 0.008),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 70 }, spawnParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = p.life * p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur   = 10;
      ctx.shadowColor  = p.color;
      ctx.fill();
      ctx.restore();

      if (p.life <= 0 || p.y < 0) {
        particles[i] = spawnParticle();
        particles[i].y = H + 5;
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
})();

/* ============================================================
   NAV DOT — active section tracking
   ============================================================ */
const sections = $$('.section');
const navDots  = $$('.nav-dot');

function updateNav() {
  const mid = window.scrollY + window.innerHeight / 2;
  sections.forEach((s, i) => {
    if (mid >= s.offsetTop && mid < s.offsetTop + s.offsetHeight) {
      navDots.forEach(d => d.classList.remove('active'));
      navDots[i]?.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ── Smooth-scroll nav dots ── */
navDots.forEach(dot => {
  dot.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(dot.getAttribute('href'));
    target?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* Smooth-scroll all anchor links */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ============================================================
   HERO — entrance animation
   ============================================================ */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .from('.bear-svg',       { opacity: 0, scale: .88, y: 30, duration: 1.2, delay: .2 })
  .from('.bear-glow-ring', { opacity: 0, scale: .6, duration: 1, ease: 'power2.out' }, '<')
  .from('.hero-badge',     { opacity: 0, y: 18, duration: .5 }, '-=.5')
  .from('.hero-greeting',  { opacity: 0, y: 16, duration: .45 }, '-=.3')
  .from('.name-line',      { opacity: 0, y: 28, stagger: .12, duration: .6 }, '-=.25')
  .from('.hero-role-line', { opacity: 0, y: 16, duration: .4 }, '-=.25')
  .from('.hero-desc',      { opacity: 0, y: 16, duration: .4 }, '-=.25')
  .from('.hero-actions',   { opacity: 0, y: 16, duration: .4 }, '-=.2')
  .from('.scroll-indicator', { opacity: 0, duration: .5 }, '-=.1');

/* ============================================================
   TIMELINE — Intersection Observer
   ============================================================ */
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, _) => {
    if (!entry.isIntersecting) return;
    // stagger by DOM order
    const items = [...$$('.tl-item')];
    const idx   = items.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('tl-visible'), idx * 90);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

$$('.tl-item').forEach(item => tlObserver.observe(item));

/* ============================================================
   GSAP ScrollTrigger — section reveals
   ============================================================ */

/* Experience header */
gsap.from('#experience .section-header', {
  scrollTrigger: { trigger: '#experience', start: 'top 78%', toggleActions: 'play none none none' },
  opacity: 0, y: 36, duration: .8, ease: 'power3.out',
});

/* Social sidebar */
gsap.from('.social-sidebar', {
  scrollTrigger: { trigger: '.social-sidebar', start: 'top 82%', toggleActions: 'play none none none' },
  opacity: 0, x: 32, duration: .8, ease: 'power3.out',
});

/* Projects header & toggle */
gsap.from('#projects .section-header', {
  scrollTrigger: { trigger: '#projects', start: 'top 78%', toggleActions: 'play none none none' },
  opacity: 0, y: 36, duration: .8, ease: 'power3.out',
});

gsap.from('.proj-toggle', {
  scrollTrigger: { trigger: '.proj-toggle', start: 'top 85%', toggleActions: 'play none none none' },
  opacity: 0, y: 20, duration: .6, ease: 'power3.out',
});

/* Project cards — stagger in on load, no scroll dependency */
function animateVisibleCards() {
  $$('.proj-card:not(.proj-hidden)').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: .5, delay: 0.1 + i * 0.08, ease: 'power3.out' }
    );
  });
}
animateVisibleCards();

/* CTA */
gsap.from('.proj-cta', {
  scrollTrigger: { trigger: '.proj-cta', start: 'top 82%', toggleActions: 'play none none none' },
  opacity: 0, y: 36, duration: .8, ease: 'power3.out',
});

/* ============================================================
   PROJECT TOGGLE — category filter
   ============================================================ */
const toggleBtns  = $$('.toggle-btn');
const projCards   = $$('.proj-card');

toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('toggle-active')) return;

    // Update button styles
    toggleBtns.forEach(b => b.classList.remove('toggle-active'));
    btn.classList.add('toggle-active');

    const filter = btn.dataset.filter;

    // Animate out current cards, animate in new ones
    let delay = 0;
    projCards.forEach(card => {
      if (card.dataset.category !== filter) {
        gsap.to(card, {
          opacity: 0, y: -12, duration: .18, ease: 'power2.in',
          onComplete: () => card.classList.add('proj-hidden'),
        });
      }
    });

    setTimeout(() => {
      let idx = 0;
      projCards.forEach(card => {
        if (card.dataset.category === filter) {
          card.classList.remove('proj-hidden');
          gsap.fromTo(card,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: .45, delay: idx * 0.07, ease: 'power3.out' }
          );
          idx++;
        }
      });
    }, 200);
  });
});

/* ============================================================
   PROJECT CARD — click to detail page
   ============================================================ */
projCards.forEach(card => {
  card.addEventListener('click', () => {
    if (card.querySelector('.card-cta-soon')) return;

    const externalLink = card.dataset.link;
    const id = card.dataset.project;

    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!id) return;

    // Exit animation before navigating
    gsap.to(card, {
      scale: 0.97, duration: .12, ease: 'power2.in',
      onComplete: () => {
        window.location.href = `projects/project-detail.html?id=${id}`;
      },
    });
  });

  // Keyboard accessibility
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') card.click();
  });
});

/* ============================================================
   BEAR TYPING — random pause/resume
   ============================================================ */
(function bearTyping() {
  const armL = document.querySelector('.bear-arm-left');
  const armR = document.querySelector('.bear-arm-right');
  if (!armL || !armR) return;

  function pause() {
    armL.style.animationPlayState = 'paused';
    armR.style.animationPlayState = 'paused';
    const delay = 600 + Math.random() * 2400;
    setTimeout(resume, delay);
  }

  function resume() {
    armL.style.animationPlayState = 'running';
    armR.style.animationPlayState = 'running';
    const delay = 1500 + Math.random() * 3500;
    setTimeout(pause, delay);
  }

  // Start the cycle after 2s
  setTimeout(pause, 2000);
})();

/* ============================================================
   PARALLAX — background grid drift
   ============================================================ */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  $$('.bg-grid').forEach(g => {
    g.style.backgroundPosition = `${y * 0.08}px ${y * 0.08}px`;
  });
}, { passive: true });

/* ============================================================
   SECTION TITLE — neon hover
   ============================================================ */
$$('.section-title').forEach(el => {
  el.addEventListener('mouseenter', () =>
    gsap.to(el, { filter: 'drop-shadow(0 0 14px rgba(0,245,255,.45))', duration: .3 })
  );
  el.addEventListener('mouseleave', () =>
    gsap.to(el, { filter: 'none', duration: .3 })
  );
});

/* ============================================================
   PAGE TRANSITION — smooth fade-in on load
   ============================================================ */
document.body.style.opacity = '0';
window.addEventListener('DOMContentLoaded', () => {
  gsap.to(document.body, { opacity: 1, duration: .6, ease: 'power2.out' });
});
