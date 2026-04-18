// NAV SCROLL
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
    });
    var menuOpen = false;
    function toggleMenu() {
      var links = document.querySelector('.nav-links');
      menuOpen = !menuOpen;
      if (menuOpen) {
        links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;width:100%;background:rgba(10,22,40,.97);padding:20px 5%;gap:16px;z-index:999;';
      } else { links.style.cssText = ''; }
    }

    // HERO SLIDESHOW
    var slides = document.querySelectorAll('.hero-slide'), cur = 0;
    setInterval(function () {
      slides[cur].classList.remove('active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('active');
    }, 5000);

    // CANVAS PARTICLES
    var canvas = document.getElementById('particles');
    var ctx = canvas.getContext('2d');
    canvas.width = innerWidth; canvas.height = innerHeight;
    window.addEventListener('resize', function () { canvas.width = innerWidth; canvas.height = innerHeight; });
    var pts = [];
    for (var i = 0; i < 55; i++) {
      pts.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 2 + 1, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, a: Math.random() * .3 + .05 });
    }
    function animPts() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74,144,217,' + p.a * 0.2 + ')';
        ctx.fill();
      });
      requestAnimationFrame(animPts);
    }
    animPts();

    // REVEAL ON SCROLL
    var reveals = document.querySelectorAll('.reveal');
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
    }, { threshold: .12 });
    reveals.forEach(function (r) { revObs.observe(r); });

    // COUNTER ANIMATION
    function animCounter(el) {
      var target = parseInt(el.dataset.count || el.dataset.target || '0');
      var prefix = el.dataset.prefix || '';
      var cur = 0, step = Math.max(1, Math.ceil(target / 80));
      var t = setInterval(function () {
        cur = Math.min(cur + step, target);
        el.textContent = prefix + cur.toLocaleString('en-IN');
        if (cur >= target) clearInterval(t);
      }, 18);
    }
    var counters = document.querySelectorAll('.stat-num');
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animCounter(e.target); cObs.unobserve(e.target); } });
    }, { threshold: .5 });
    counters.forEach(function (c) { cObs.observe(c); });

    // MENU TABS
    function switchTab(idx) {
      document.querySelectorAll('.menu-tab').forEach(function (t, i) { t.classList.toggle('active', i === idx); });
      document.querySelectorAll('.menu-panel').forEach(function (p, i) { p.classList.toggle('active', i === idx); });
    }

    // SEED BOOKINGS
    var allBookings = [
      { name: 'Rajesh Kumar', guests: '4 Guests', date: '2025-11-15', time: '7:30 PM', occasion: 'Family Gathering' },
      { name: 'Priya &amp; Arjun', guests: '2 Guests', date: '2025-11-16', time: '8:00 PM', occasion: 'Anniversary' },
      { name: 'Santhosh S', guests: '6 Guests', date: '2025-11-17', time: '1:00 PM', occasion: 'Birthday' },
      { name: 'Kavitha M', guests: '3 Guests', date: '2025-11-18', time: '7:00 PM', occasion: 'Regular Dining' },
      { name: 'Vikram Rajan', guests: '2 Guests', date: '2025-11-19', time: '8:30 PM', occasion: 'Candle Light Dinner' },
      { name: 'Meena &amp; Family', guests: '7+ Guests', date: '2025-11-20', time: '12:30 PM', occasion: 'Family Gathering' },
    ];

    function renderBookings() {
      var c = document.getElementById('bookings-container');
      var shown = allBookings.slice(-9).reverse();
      c.innerHTML = shown.map(function (b) {
        return '<div class="booking-card"><div class="card-name">' + b.name + '</div>'
          + '<div class="card-detail"><span>&#128197;</span>' + b.date + '</div>'
          + '<div class="card-detail"><span>&#9200;</span>' + b.time + '</div>'
          + '<div class="card-detail"><span>&#127881;</span>' + b.occasion + '</div>'
          + '<div class="card-guests">&#128101; ' + b.guests + '</div></div>';
      }).join('');
    }
    renderBookings();

    function formatTime(t) {
      var parts = t.split(':'), h = parseInt(parts[0]), m = parts[1], ampm = h >= 12 ? 'PM' : 'AM';
      var h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return h12 + ':' + m + ' ' + ampm;
    }

    function submitBooking() {
      var name = document.getElementById('bk-name').value.trim();
      var phone = document.getElementById('bk-phone').value.trim();
      var date = document.getElementById('bk-date').value;
      var time = document.getElementById('bk-time').value;
      var guests = document.getElementById('bk-guests').value;
      var occasion = document.getElementById('bk-occasion').value;
      if (!name || !phone || !date || !time) { alert('Please fill in Name, Phone, Date and Time.'); return; }
      allBookings.push({ name: name, guests: guests, date: date, time: formatTime(time), occasion: occasion });
      renderBookings();
      var msg = document.getElementById('success-msg');
      msg.style.display = 'block';
      document.getElementById('bk-name').value = '';
      document.getElementById('bk-phone').value = '';
      document.getElementById('bk-date').value = '';
      document.getElementById('bk-time').value = '';
      document.getElementById('bk-notes').value = '';
      setTimeout(function () { msg.style.display = 'none'; }, 5000);
      document.getElementById('bookings-list').scrollIntoView({ behavior: 'smooth' });
    }