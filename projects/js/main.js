/* scroll progress */
var progress = document.getElementById('progress');
function onScroll(){
  var h = document.documentElement;
  var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
}
document.addEventListener('scroll', onScroll, {passive:true});

/* reveal on scroll (blur, chapters, cards, experience cards) */
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var els = document.querySelectorAll('.reveal-el, .blur-reveal, .chapter-num, .chapter h2, .chapter p, .pcard, .tl-card');
if(reduced){
  els.forEach(function(el){ el.classList.add('in-view'); });
} else {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        if(entry.target.classList.contains('num') === false){
          var num = entry.target.querySelector ? entry.target.querySelector('.num[data-count]') : null;
          if(num && !num.dataset.done){ animateCount(num); }
        }
      }
    });
  }, {threshold:0.35});
  els.forEach(function(el){ io.observe(el); });
}

function animateCount(el){
  el.dataset.done = '1';
  var target = parseFloat(el.dataset.count);
  var suffix = el.dataset.suffix || '';
  var prefix = el.dataset.prefix || '';
  var start = performance.now();
  var dur = 1100;
  function tick(now){
    var t = Math.min(1, (now - start) / dur);
    var eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* experience-card zoom-into-case-study */
function openCase(card, keyOverride){
  var key = keyOverride || card.dataset.case;
  var overlay = document.querySelector('.case-overlay[data-case="' + key + '"]');
  if(!overlay) return;
  var r = card.getBoundingClientRect();
  overlay.style.setProperty('--ox', (r.left + r.width/2) + 'px');
  overlay.style.setProperty('--oy', (r.top + r.height/2) + 'px');
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ overlay.classList.add('open'); });
  });
  document.body.style.overflow = 'hidden';
  overlay.setAttribute('aria-hidden', 'false');
}
function closeCase(overlay){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  overlay.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.tl-card').forEach(function(card){
  card.addEventListener('click', function(){ openCase(card); });
  card.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openCase(card); }
  });
});
document.querySelectorAll('.case-close').forEach(function(btn){
  btn.addEventListener('click', function(){ closeCase(btn.closest('.case-overlay')); });
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){
    var open = document.querySelector('.case-overlay.open');
    if(open) closeCase(open);
  }
});

/* headline decode / scramble-in on load */
(function(){
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#/\\<>*';
  var spans = document.querySelectorAll('#heroHeadline .sc');
  if(reduced || !spans.length) return;
  spans.forEach(function(el, idx){
    var final = el.textContent;
    var len = final.length;
    setTimeout(function(){
      var frame = 0, totalFrames = len * 2.5 + 16;
      (function tick(){
        frame++;
        var revealed = Math.floor((frame / totalFrames) * len);
        var out = '';
        for(var i=0;i<len;i++){
          if(i < revealed || final[i] === ' ') out += final[i];
          else out += chars[Math.floor(Math.random()*chars.length)];
        }
        el.textContent = out;
        if(revealed < len) requestAnimationFrame(tick); else el.textContent = final;
      })();
    }, 260 + idx * 180);
  });
})();

/* cursor stirs the fog, site-wide — glow ring + local clearing everywhere */
var heroRing = document.getElementById('heroRing');
var mouseX = null, mouseY = null;
if(!reduced && heroRing){
  document.addEventListener('mousemove', function(e){
    mouseX = e.clientX; mouseY = e.clientY;
    heroRing.style.setProperty('--rx', mouseX + 'px');
    heroRing.style.setProperty('--ry', mouseY + 'px');
    heroRing.classList.add('active');
  });
  document.addEventListener('mouseout', function(e){
    if(!e.relatedTarget && !e.toElement){
      mouseX = null; mouseY = null;
      heroRing.classList.remove('active');
    }
  });
}

/* project toggle */
var toggleBtns = document.querySelectorAll('.proj-toggle button');
toggleBtns.forEach(function(btn){
  btn.addEventListener('click', function(){
    toggleBtns.forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var filter = btn.dataset.filter;
    document.querySelectorAll('.pgrid').forEach(function(grid){
      grid.classList.toggle('hidden-grid', grid.dataset.grid !== filter);
    });
  });
});

/* tilt cards */
if(!reduced){
  document.querySelectorAll('.tilt').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(700px) rotateY(' + (x*7) + 'deg) rotateX(' + (-y*7) + 'deg) translateY(-2px)';
    });
    card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
  });
}

/* Mario-Boo easter egg — wanders the whole page, flees when the cursor gets close */
(function(){
  var anchor = document.getElementById('booAnchor');
  if(reduced || !anchor) return;
  var size = 72, margin = 40;
  var vw = window.innerWidth, vh = window.innerHeight;
  window.addEventListener('resize', function(){ vw = window.innerWidth; vh = window.innerHeight; });

  var curX = vw * 0.75, curY = vh * 0.22;
  var wanderX = curX, wanderY = curY;

  function pickWander(){
    wanderX = margin + Math.random() * (vw - size - margin * 2);
    wanderY = margin + Math.random() * (vh - size - margin * 2);
  }
  pickWander();
  setInterval(pickWander, 4500 + Math.random() * 3500);

  function frame(){
    var centerX = curX + size / 2, centerY = curY + size / 2;
    var targetX = wanderX, targetY = wanderY, fleeing = false;

    if(mouseX !== null){
      var dx = centerX - mouseX, dy = centerY - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var radius = 220;
      if(dist < radius){
        fleeing = true;
        var strength = (radius - dist) / radius;
        var angle = Math.atan2(dy, dx);
        targetX = Math.min(Math.max(curX + Math.cos(angle) * strength * 160, margin), vw - size - margin);
        targetY = Math.min(Math.max(curY + Math.sin(angle) * strength * 160, margin), vh - size - margin);
        anchor.classList.toggle('shy', dist < 110);
      } else {
        anchor.classList.remove('shy');
      }
    }

    var ease = fleeing ? 0.16 : 0.012;
    curX += (targetX - curX) * ease;
    curY += (targetY - curY) * ease;
    anchor.style.setProperty('--bx', curX.toFixed(1) + 'px');
    anchor.style.setProperty('--by', curY.toFixed(1) + 'px');
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* drifting fog canvas */
var canvas = document.getElementById('fog');
var ctx = canvas.getContext('2d');
var W, H;
function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2fe6d9';
var accent2 = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#ff3d94';
var blobs = [];
var count = reduced ? 0 : 7;
for(var i=0;i<count;i++){
  blobs.push({
    x: Math.random()*W, y: Math.random()*H,
    r: 220 + Math.random()*260,
    vx: (Math.random()-0.5)*0.12, vy: (Math.random()-0.5)*0.10,
    hue: i % 2 === 0 ? accent : accent2,
    a: 0.05 + Math.random()*0.05
  });
}
function draw(){
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0,0,W,H);
  blobs.forEach(function(b){
    b.x += b.vx; b.y += b.vy;
    if(b.x < -b.r) b.x = W + b.r; if(b.x > W + b.r) b.x = -b.r;
    if(b.y < -b.r) b.y = H + b.r; if(b.y > H + b.r) b.y = -b.r;
    var g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
    g.addColorStop(0, b.hue + '');
    g.addColorStop(1, 'transparent');
    ctx.globalAlpha = b.a;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  if(mouseX !== null){
    ctx.globalCompositeOperation = 'destination-out';
    var clear = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 260);
    clear.addColorStop(0, 'rgba(0,0,0,0.9)');
    clear.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = clear;
    ctx.beginPath(); ctx.arc(mouseX, mouseY, 260, 0, Math.PI*2); ctx.fill();
  }
  if(!reduced) requestAnimationFrame(draw);
}
if(!reduced) requestAnimationFrame(draw); else draw();
