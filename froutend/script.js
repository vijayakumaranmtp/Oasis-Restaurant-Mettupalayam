
/* ══════════════════════════════════════════
   LIQUID CHROME — WebGL canvas on hero
══════════════════════════════════════════ */
(function initLiquidChrome() {
  var canvas = document.getElementById('liquid-canvas');
  if (!canvas) return;
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.style.display = 'none'; return; }

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}');
  gl.compileShader(vs);

  // Liquid chrome fragment shader — iridescent fluid distortion
  var fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_mouse;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 m  = u_mouse / u_res;
      float t = u_time * 0.4;

      // Fluid distortion layers
      float d = length(uv - m);
      float ripple = sin(d * 18.0 - t * 3.0) * 0.5 + 0.5;
      ripple *= exp(-d * 3.5);

      float n1 = sin(uv.x * 6.0 + t)     * cos(uv.y * 5.0 - t * 0.7);
      float n2 = sin(uv.x * 3.0 - t*0.5) * sin(uv.y * 8.0 + t * 1.2);
      float n3 = cos(uv.x * 9.0 + uv.y * 4.0 + t * 0.8);
      float noise = (n1 + n2 + n3) * 0.25 + ripple * 0.5;

      // Chrome colour — deep blue/navy with gold shimmer
      vec3 col1 = vec3(0.04, 0.09, 0.18);   // navy
      vec3 col2 = vec3(0.10, 0.23, 0.42);   // blue
      vec3 col3 = vec3(0.79, 0.66, 0.30);   // gold

      float f = noise * 0.5 + 0.5;
      vec3 col = mix(col1, col2, f);
      col = mix(col, col3, ripple * 0.25);

      gl_FragColor = vec4(col, 0.55);
    }
  `;
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');

  var mx = 0, my = 0, start = Date.now();
  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  (function frame() {
    if (!canvas.closest('.hero')) return; // stop if hero scrolled far
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, (Date.now() - start) / 1000);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mx, canvas.height - my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  })();
})();

/* ══════════════════════════════════════════
   CURVED MARQUEE (SVG textPath, draggable)
══════════════════════════════════════════ */
(function initCurvedMarquee() {
  var svg = document.getElementById('curved-marquee-svg');
  var tp = document.getElementById('curved-tp');
  if (!svg || !tp) return;

  var speed = 1.2, offset = 0, dragging = false, lastX = 0, vel = 0, dir = -1;
  var pathLen = 1600;

  function step() {
    if (!dragging) offset += dir * speed;
    if (offset < -pathLen) offset += pathLen;
    if (offset > 0) offset -= pathLen;
    tp.setAttribute('startOffset', offset + 'px');
    requestAnimationFrame(step);
  }
  step();

  svg.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; vel = 0; svg.setPointerCapture(e.pointerId); svg.style.cursor = 'grabbing'; });
  svg.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - lastX; lastX = e.clientX; vel = dx; offset += dx; if (offset < -pathLen) offset += pathLen; if (offset > 0) offset -= pathLen; tp.setAttribute('startOffset', offset + 'px'); });
  svg.addEventListener('pointerup', function (e) { dragging = false; dir = vel > 0 ? 1 : -1; svg.style.cursor = 'grab'; });
  svg.addEventListener('pointerleave', function () { if (dragging) { dragging = false; svg.style.cursor = 'grab'; } });
})();

/* ══════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════ */
var dot = document.getElementById('cursor-dot');
var ring = document.getElementById('cursor-ring');
var mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
(function animRing() { rx += (mx - rx) * .13; ry += (my - ry) * .13; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(animRing); })();

document.querySelectorAll('a,button,.menu-tab,.filter-btn,.gallery-item,.about-feat,.review-card').forEach(function (el) {
  el.addEventListener('mouseenter', function () { ring.classList.add('hover'); dot.classList.add('hover'); });
  el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); dot.classList.remove('hover'); });
});

// Magnetic text repel on headings (MagneticText effect)
document.querySelectorAll('.hero-title,.section-title,.reviews-title,.bookings-title').forEach(function (el) {
  el.addEventListener('mousemove', function (e) {
    var r = el.getBoundingClientRect();
    var dx = (e.clientX - r.left - r.width / 2) * 0.06;
    var dy = (e.clientY - r.top - r.height / 2) * 0.06;
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
  el.addEventListener('mouseleave', function () { el.style.transform = ''; });
});

/* ══════════════════════════════════════════
   NAV SCROLL
══════════════════════════════════════════ */
window.addEventListener('scroll', function () {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
});
var menuOpen = false;
function toggleMenu() {
  var links = document.querySelector('.nav-links');
  menuOpen = !menuOpen;
  if (menuOpen) links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;width:100%;background:rgba(10,22,40,.97);padding:20px 5%;gap:16px;z-index:999;';
  else links.style.cssText = '';
}

/* ══════════════════════════════════════════
   HERO SLIDESHOW
══════════════════════════════════════════ */
var slides = document.querySelectorAll('.hero-slide'), cur = 0;
setInterval(function () {
  slides[cur].classList.remove('active');
  cur = (cur + 1) % slides.length;
  slides[cur].classList.add('active');
}, 5000);

/* ══════════════════════════════════════════
   CANVAS PARTICLES
══════════════════════════════════════════ */
var canvas2 = document.getElementById('particles'), ctx = canvas2.getContext('2d');
canvas2.width = innerWidth; canvas2.height = innerHeight;
window.addEventListener('resize', function () { canvas2.width = innerWidth; canvas2.height = innerHeight; });
var pts = [];
for (var i = 0; i < 55; i++) pts.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 2 + 1, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, a: Math.random() * .3 + .05 });
(function animPts() {
  ctx.clearRect(0, 0, canvas2.width, canvas2.height);
  pts.forEach(function (p) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > canvas2.width) p.vx *= -1; if (p.y < 0 || p.y > canvas2.height) p.vy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(74,144,217,' + p.a * .2 + ')'; ctx.fill(); });
  requestAnimationFrame(animPts);
})();

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
var rObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); rObs.unobserve(e.target); } });
}, { threshold: .1 });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(function (el) { rObs.observe(el); });

/* ══════════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════════ */
function animCounter(el) {
  var target = parseInt(el.dataset.count || el.dataset.target || '0'), prefix = el.dataset.prefix || '', c = 0;
  var t = setInterval(function () { c = Math.min(c + Math.max(1, Math.ceil(target / 80)), target); el.textContent = prefix + c.toLocaleString('en-IN'); if (c >= target) clearInterval(t); }, 18);
}
var cObs = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { animCounter(e.target); cObs.unobserve(e.target); } }); }, { threshold: .5 });
document.querySelectorAll('.stat-num').forEach(function (c) { cObs.observe(c); });

/* ══════════════════════════════════════════
   MENU TABS + FILTERS
══════════════════════════════════════════ */
var currentFilter = 'all';
function switchTab(idx) {
  document.querySelectorAll('.menu-tab').forEach(function (t, i) { t.classList.toggle('active', i === idx); });
  document.querySelectorAll('.menu-panel').forEach(function (p, i) { p.classList.toggle('active', i === idx); });
  applyFilter(currentFilter);
}
function applyFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.filter === f); });
  var panel = document.querySelector('.menu-panel.active');
  if (!panel) return;
  panel.querySelectorAll('.menu-item').forEach(function (item) {
    var type = item.dataset.type, price = parseInt(item.dataset.price) || 0, show = false;
    if (f === 'all') show = true;
    else if (f === 'veg') show = (type === 'veg');
    else if (f === 'nonveg') show = (type === 'nonveg');
    else if (f === 'under200') show = (price < 200);
    else if (f === 'under400') show = (price < 400);
    item.style.display = show ? '' : 'none';
  });
}
document.querySelectorAll('.filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () { applyFilter(this.dataset.filter); });
});

/* ══════════════════════════════════════════
   BOOKING → Google Form prefill
══════════════════════════════════════════ */
// SETUP: get prefill link from your Google Form (⋮ menu → Get pre-filled link)
// Then replace these values:
var BOOKING_FORM_BASE = 'YOUR_GOOGLE_FORM_BASE_URL_HERE';
var ENTRY_NAME = 'entry.111111111';
var ENTRY_PHONE = 'entry.222222222';
var ENTRY_DATE = 'entry.333333333';
var ENTRY_TIME = 'entry.444444444';
var ENTRY_GUESTS = 'entry.555555555';
var ENTRY_SEATING = 'entry.666666666';
var ENTRY_OCCASION = 'entry.777777777';
var ENTRY_NOTES = 'entry.888888888';

function formatTime(t) { var p = t.split(':'), h = parseInt(p[0]), m = p[1], ap = h >= 12 ? 'PM' : 'AM', h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h); return h12 + ':' + m + ' ' + ap; }

function submitBooking() {
  var name = document.getElementById('bk-name').value.trim();
  var phone = document.getElementById('bk-phone').value.trim();
  var date = document.getElementById('bk-date').value;
  var time = document.getElementById('bk-time').value;
  var guests = document.getElementById('bk-guests').value;
  var seating = document.getElementById('bk-seating').value;
  var occasion = document.getElementById('bk-occasion').value;
  var notes = document.getElementById('bk-notes').value.trim();
  var errors = [];

  if (!name) errors.push('Full Name');
  if (!phone) errors.push('Phone Number');
  if (!date) errors.push('Date');
  if (!time) errors.push('Time');
  if (!guests) errors.push('Number of Guests');
  if (!seating) errors.push('Seating (AC / Non-AC)');
  if (errors.length) { alert('Please fill in: ' + errors.join(', ')); return; }

  var message = "New Reservation Request:\n\n"
    + "Name: " + name + "\n"
    + "Phone: " + phone + "\n"
    + "Date: " + date + "\n"
    + "Time: " + formatTime(time) + "\n"
    + "Guests: " + guests + "\n"
    + "Seating: " + seating + "\n"
    + "Occasion: " + occasion + "\n"
    + "Notes: " + notes;

  var whatsappUrl = "https://wa.me/+919150999777?text=" + encodeURIComponent(message);
  window.open(whatsappUrl, '_blank');

  var msg = document.getElementById('success-msg');
  msg.style.display = 'block';
  ['bk-name', 'bk-phone', 'bk-date', 'bk-time', 'bk-notes'].forEach(function (id) { document.getElementById(id).value = ''; });
  document.getElementById('bk-guests').value = '';
  document.getElementById('bk-seating').value = '';
  setTimeout(function () { msg.style.display = 'none'; }, 6000);
}

function renderReviews(revs) {
  var mWrap = document.getElementById('reviews-marquee-wrap');
  var mEl = document.getElementById('reviews-marquee');
  var grid = document.getElementById('reviews-grid');
  if (!revs || !revs.length) { grid.innerHTML = '<p class="no-reviews">No reviews yet.</p>'; return; }
  // Scrolling marquee (duplicate for loop)
  var html = revs.map(function (r) { return card(r, 0); }).join('');
  mEl.innerHTML = html + html;
  mWrap.style.display = 'block';
  // Static grid with stagger
  grid.innerHTML = revs.map(function (r, i) { return card(r, i * 0.07); }).join('');
}
function showLoading(v) { document.getElementById('reviews-loading').style.display = v ? 'flex' : 'none'; }
function showError(v) { document.getElementById('reviews-error').style.display = v ? 'block' : 'none'; }
function loadReviews() {
  showError(false);
  if (!SHEET_CSV_URL || SHEET_CSV_URL.indexOf('YOUR_GOOGLE') === 0) { showLoading(false); renderReviews(FALLBACK_REVIEWS); return; }
  showLoading(true);
  fetch(SHEET_CSV_URL).then(function (r) { if (!r.ok) throw 0; return r.text(); })
    .then(function (t) { showLoading(false); var r = parseCSV(t); renderReviews(r.length ? r : FALLBACK_REVIEWS); })
    .catch(function () { showLoading(false); renderReviews(FALLBACK_REVIEWS); showError(true); });
}
var rvObs = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { loadReviews(); rvObs.unobserve(e.target); } }) }, { threshold: .1 });
var rvSec = document.getElementById('reviews');
if (rvSec) rvObs.observe(rvSec);

/* ══════════════════════════════════════════
   HOVER REVEAL EFFECT (CURSOR FOLLOWING)
══════════════════════════════════════════ */
(function initHoverReveal() {
  var reveal = document.getElementById('menu-hover-reveal');
  var revealImg = document.getElementById('menu-hover-img');
  if (!reveal || !revealImg) return;

  var currentX = window.innerWidth / 2;
  var currentY = window.innerHeight / 2;
  var targetX = currentX;
  var targetY = currentY;
  var isHovering = false;
  var reqId = null;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function animate() {
    currentX = lerp(currentX, targetX, 0.15);
    currentY = lerp(currentY, targetY, 0.15);
    
    // Scale slightly when active
    var scale = isHovering ? 1 : 0.8;
    
    reveal.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px) translate(-50%, -50%) scale(' + scale + ')';
    
    if (isHovering || Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      reqId = requestAnimationFrame(animate);
    } else {
      reqId = null;
    }
  }

  document.addEventListener('mousemove', function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (isHovering && !reqId) {
      reqId = requestAnimationFrame(animate);
    }
  });

  document.querySelectorAll('.hover-trigger').forEach(function (item) {
    item.addEventListener('mouseenter', function (e) {
      isHovering = true;
      var imgSrc = item.getAttribute('data-image');
      if (imgSrc) {
        revealImg.src = imgSrc;
        // Pre-set target to avoid huge initial jumps if moving fast
        targetX = e.clientX;
        targetY = e.clientY;
        if (Math.abs(currentX - targetX) > 200 || Math.abs(currentY - targetY) > 200) {
            currentX = targetX;
            currentY = targetY;
        }
      }
      reveal.style.opacity = '1';
      
      if (!reqId) reqId = requestAnimationFrame(animate);
    });
    
    item.addEventListener('mouseleave', function () {
      isHovering = false;
      reveal.style.opacity = '0';
    });
  });
})();

/* ══════════════════════════════════════════
   SCROLL STACK
══════════════════════════════════════════ */
function initScrollStack() {
  const scrollers = document.querySelectorAll('.scroll-stack-scroller');
  if(!scrollers.length) return;

  function getElementOffsetWithoutTransform(el) {
    let top = 0;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return top;
  }

  function parsePercentage(value, containerHeight) {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }

  function update() {
    scrollers.forEach(scroller => {
      // Only process active panels (to save performance and prevent bugs on hidden items)
      if (scroller.closest('.menu-panel') && !scroller.closest('.menu-panel').classList.contains('active')) return;

      const inner = scroller.querySelector('.scroll-stack-inner');
      const cards = Array.from(inner.querySelectorAll('.scroll-stack-card')).filter(c => c.style.display !== 'none');
      const endElement = inner.querySelector('.scroll-stack-end');
      if (!cards.length) return;

      const itemDistance = 16;
      const itemScale = 0.03;
      const itemStackDistance = 15;
      const stackPosition = '20%';
      const scaleEndPosition = '5%';
      const baseScale = 0.9;

      const scrollTop = window.scrollY;
      const containerHeight = window.innerHeight;
      const stackPositionPx = parsePercentage(stackPosition, containerHeight);
      const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
      
      const endElementTop = endElement ? getElementOffsetWithoutTransform(endElement) : 0;

      cards.forEach((card, i) => {
        // Init styles if not set
        if (!card.dataset.stacked) {
          card.style.marginBottom = `${itemDistance}px`;
          card.style.willChange = 'transform, filter';
          card.style.transformOrigin = 'top center';
          card.style.backfaceVisibility = 'hidden';
          card.dataset.stacked = "true";
        }

        const cardTop = getElementOffsetWithoutTransform(card);
        const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
        const pinEnd = endElementTop - containerHeight / 2;

        let scaleProgress = 0;
        if (scrollTop > triggerStart) {
            if (scrollTop > triggerEnd) scaleProgress = 1;
            else scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);
        }

        const targetScale = baseScale + i * itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);

        let translateY = 0;
        const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

        if (isPinned) {
          translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
        }

        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      });
    });
  }

  window.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  // Also run update when filters or tabs are clicked
  document.querySelectorAll('.menu-tab, .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { setTimeout(update, 50); });
  });
  update();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initScrollStack);

function initParticleText() {
  const canvas = document.getElementById("particle-text-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth || window.innerWidth;
  canvas.height = 250;

  let particles = [];
  let mouse = {
    x: null,
    y: null,
    radius: 80
  };

  const handleMouseMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  };
  
  const handleTouchMove = (event) => {
    if (event.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.touches[0].clientX - rect.left;
      mouse.y = event.touches[0].clientY - rect.top;
    }
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("touchmove", handleTouchMove, { passive: true });

  window.addEventListener("resize", () => {
    canvas.width = parent.clientWidth || window.innerWidth;
    canvas.height = 250;
    setupText();
  });

  class Particle {
    constructor(x, y) {
      this.baseX = x;
      this.baseY = y;
      this.x = x;
      this.y = y;
      this.size = 2;
      this.density = Math.random() * 30 + 1;
    }

    draw() {
      ctx.fillStyle = "#c9a84c";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        let force = (mouse.radius - distance) / mouse.radius;
        let directionX = dx / distance;
        let directionY = dy / distance;

        this.x -= directionX * force * this.density;
        this.y -= directionY * force * this.density;
      } else {
        this.x += (this.baseX - this.x) * 0.05;
        this.y += (this.baseY - this.y) * 0.05;
      }
    }
  }

  function setupText() {
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 100px 'Playfair Display', serif";
    ctx.fillStyle = "#c9a84c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OASIS", canvas.width / 2, canvas.height / 2 - 25);
    
    ctx.font = "600 22px 'Playfair Display', serif";
    ctx.fillText("RESTAURANT", canvas.width / 2, canvas.height / 2 + 50);

    const textData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const index = (y * canvas.width + x) * 4;
        if (textData.data[index + 3] > 128) {
          particles.push(new Particle(x, y));
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  // Delay setup slightly to ensure fonts are loaded
  setTimeout(() => {
    setupText();
    animate();
  }, 500);
}

window.addEventListener('DOMContentLoaded', initParticleText);
