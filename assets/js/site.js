/* عمرتهم — سكربت الموقع (بدون مكتبات) */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* الرأس: ظل عند التمرير + قائمة الجوال */
  var header = document.querySelector('.header');
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      drawer.classList.toggle('is-open', !open);
      document.body.classList.toggle('drawer-open', !open);
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
      });
    });
  }

  /* الظهور عند التمرير */
  var rv = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* التبويبات */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = root.querySelectorAll('[role="tab"]');
    var panels = root.querySelectorAll('[role="tabpanel"]');
    function select(i) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
          var n = (i + (ev.key === 'ArrowRight' ? -1 : 1) + tabs.length) % tabs.length; /* RTL */
          select(n); tabs[n].focus(); ev.preventDefault();
        }
      });
    });
    var h = location.hash.replace('#', '');
    var start = 0;
    tabs.forEach(function (t, i) { if (t.dataset.tab === h) start = i; });
    select(start);
  });

  /* الباقات والأسعار */
  var COUNTRIES = [
    { code: 'SA', name: 'السعودية', flag: '🇸🇦', cur: 'SAR', sym: 'ر.س', dec: 2 },
    { code: 'AE', name: 'الإمارات', flag: '🇦🇪', cur: 'AED', sym: 'د.إ', dec: 2 },
    { code: 'KW', name: 'الكويت', flag: '🇰🇼', cur: 'KWD', sym: 'د.ك', dec: 3 },
    { code: 'QA', name: 'قطر', flag: '🇶🇦', cur: 'QAR', sym: 'ر.ق', dec: 2 },
    { code: 'BH', name: 'البحرين', flag: '🇧🇭', cur: 'BHD', sym: 'د.ب', dec: 3 },
    { code: 'OM', name: 'عُمان', flag: '🇴🇲', cur: 'OMR', sym: 'ر.ع', dec: 3 }
  ];

  /* نسخة احتياطية من الأسعار (مأخوذة من الخادم بتاريخ 2026-11-07) تُستخدم إذا تعذّر الاتصال */
  var FALLBACK = {
    packages: [
      { id: 'premium', name: 'عمرة البدل المميزة', umrah_count: 1, sla_hours: 72, enabled: true, seasonal: false, allows_dua: true, priority: false, sort: 1 },
      { id: 'basic', name: 'عمرة البدل الأساسية', umrah_count: 1, sla_hours: 168, enabled: true, seasonal: false, allows_dua: false, priority: false, sort: 2 },
      { id: 'express', name: 'عمرة البدل العاجلة', umrah_count: 1, sla_hours: 24, enabled: true, seasonal: false, allows_dua: true, priority: true, sort: 3 },
      { id: 'parents', name: 'باقة الوالدين', umrah_count: 2, sla_hours: 168, enabled: true, seasonal: false, allows_dua: false, priority: false, sort: 4 },
      { id: 'wafa', name: 'باقة الوفاء', umrah_count: 5, sla_hours: 720, enabled: true, seasonal: false, allows_dua: false, priority: false, sort: 5 },
      { id: 'ramadan', name: 'عمرة رمضان', umrah_count: 1, sla_hours: 720, enabled: true, seasonal: true, allows_dua: true, priority: false, sort: 6 }
    ],
    prices: {
      premium: { SAR: 399, AED: 389, KWD: 32.5, QAR: 389, BHD: 40, OMR: 41 },
      basic: { SAR: 299, AED: 289, KWD: 24.5, QAR: 289, BHD: 30, OMR: 30.5 },
      express: { SAR: 499, AED: 489, KWD: 41, QAR: 489, BHD: 50, OMR: 51 },
      parents: { SAR: 549, AED: 539, KWD: 45, QAR: 529, BHD: 55, OMR: 56.5 },
      wafa: { SAR: 1199, AED: 1179, KWD: 98.5, QAR: 1159, BHD: 120, OMR: 123 },
      ramadan: { SAR: 599, AED: 589, KWD: 49, QAR: 579, BHD: 60, OMR: 61.5 }
    }
  };

  /* الوصف والمزايا (من كتالوج التطبيق) */
  var META = {
    premium: { badge: 'الأكثر طلبًا', hot: true, short: 'توثيق أوسع، وتحديث مباشر، ودعاء خاص بنصّك عند الملتزم.', features: ['تنفيذ أسرع خلال 72 ساعة', 'تحديث مباشر مع كل مرحلة من المراحل السبع', 'دعاء خاص تكتبه أنت يُدعى به باسمه عند الملتزم', 'صورة لركعتي المقام وشرب زمزم', 'ملف توثيق كامل وشهادة إتمام باسمه'] },
    basic: { short: 'عمرة كاملة مع مؤدٍّ موثّق، وتوثيق بالفيديو، وشهادة إتمام باسمه.', features: ['مؤدٍّ موثّق الهوية اعتمر عن نفسه', 'فيديو النية باسم المستفيد', 'مقاطع من الطواف والسعي وصورة التحلّل', 'شهادة إتمام رقمية باسمه'] },
    express: { badge: 'عاجل', short: 'أولوية في الإسناد، وتنفيذ خلال 24 ساعة حسب توفّر التصاريح.', features: ['أولوية في إسناد المؤدي', 'تنفيذ خلال 24 ساعة حسب تصاريح نسك', 'توثيق كامل لكل المراحل وشهادة إتمام', 'إذا تعذّر التنفيذ في الوقت نسترد لك الفرق'] },
    parents: { short: 'عمرتان: عن الأب وعن الأم، بتوثيق كامل وشهادتين باسميهما.', features: ['عمرتان مستقلتان عن الأب وعن الأم', 'النية باسم كل واحد منهما', 'شهادتا إتمام باسميهما', 'أوفر من طلب عمرتين منفصلتين'] },
    wafa: { short: 'خمس عمرات على مدى شهر، تقدر توزّعها على أكثر من شخص.', features: ['خمس عمرات، تقريبًا عمرة كل أسبوع', 'توزّعها على أكثر من شخص', 'توثيق كامل وخمس شهادات إتمام'] },
    ramadan: { badge: 'موسمي', short: 'في أيام رمضان أو العشر الأواخر، والعدد محدود فاحجز مبكرًا.', features: ['سعر لأيام رمضان وسعر للعشر الأواخر، يظهر لك عند الحجز', 'توثيق كامل وشهادة إتمام باسمه', 'العدد محدود حسب المؤدين والتصاريح'] }
  };

  function slaLabel(p) {
    if (p.seasonal) return 'في رمضان';
    if (p.sla_hours <= 72) return 'خلال ' + p.sla_hours + ' ساعة';
    if (p.sla_hours <= 168) return 'خلال ' + Math.round(p.sla_hours / 24) + ' أيام';
    return 'على مدى شهر';
  }
  function umrahLabel(n) { return n === 1 ? 'عمرة واحدة' : n === 2 ? 'عمرتان' : n + ' عمرات'; }
  function money(n, c) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: c.dec, maximumFractionDigits: c.dec });
  }

  var pkgRoot = document.getElementById('pkgs');
  if (pkgRoot) {
    var switcher = document.getElementById('country-switch');
    var data = FALLBACK;
    var live = false;
    var current = detectCountry();

    function detectCountry() {
      try {
        var saved = localStorage.getItem('um_country');
        if (saved && COUNTRIES.some(function (c) { return c.code === saved; })) return saved;
      } catch (e) {}
      var lang = (navigator.language || '').toUpperCase();
      var m = lang.match(/-([A-Z]{2})$/);
      var region = m ? m[1] : '';
      return COUNTRIES.some(function (c) { return c.code === region; }) ? region : 'SA';
    }

    function renderSwitch() {
      switcher.innerHTML = '';
      COUNTRIES.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-pressed', String(c.code === current));
        b.innerHTML = '<span class="flag" aria-hidden="true">' + c.flag + '</span>' + c.name + ' <span class="muted">' + c.sym + '</span>';
        b.addEventListener('click', function () {
          current = c.code;
          try { localStorage.setItem('um_country', c.code); } catch (e) {}
          renderSwitch(); renderPkgs();
        });
        switcher.appendChild(b);
      });
    }

    function renderPkgs() {
      var c = COUNTRIES.filter(function (x) { return x.code === current; })[0];
      var list = data.packages.filter(function (p) { return p.enabled !== false; }).sort(function (a, b) { return a.sort - b.sort; });
      pkgRoot.innerHTML = list.map(function (p) {
        var m = META[p.id] || { short: '', features: [] };
        var price = (data.prices[p.id] || {})[c.cur];
        var badges = '';
        if (m.badge) badges += '<span class="badge' + (m.hot ? ' badge--saffron' : '') + '">' + m.badge + '</span>';
        badges += '<span class="badge badge--line">' + umrahLabel(p.umrah_count) + '</span>';
        return '<article class="pkg' + (m.hot ? ' pkg--hot' : '') + '" id="pkg-' + p.id + '">' +
          '<div class="pkg__badges">' + badges + '</div>' +
          '<h3>' + p.name + '</h3>' +
          '<p class="pkg__short">' + m.short + '</p>' +
          '<div class="pkg__price">' + (price != null ? '<b>' + money(price, c) + '</b><span>' + c.sym + '</span>' : '<span>السعر يظهر في التطبيق</span>') + '</div>' +
          '<div class="pkg__meta"><span>شامل الضريبة</span><span>' + slaLabel(p) + '</span>' + (p.allows_dua ? '<span>دعاء خاص</span>' : '') + '</div>' +
          '<ul class="pkg__feat">' + m.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
          '<a class="btn ' + (m.hot ? 'btn--primary' : 'btn--ghost') + ' btn--block" href="#download">اطلبها من التطبيق</a>' +
          '</article>';
      }).join('');
      var note = document.getElementById('pkgs-note');
      if (note) note.textContent = 'الأسعار بعملة ' + c.name + ' شاملة الضريبة' + (live ? '، ومحدّثة مباشرة من خادم عمرتهم.' : '. تُحدَّث تلقائيًا عند توفّر الاتصال.');
    }

    renderSwitch(); renderPkgs();

    /* تحديث حي من Supabase (مفتاح عام للقراءة فقط) */
    var URL = 'https://jswkdjrozjtvdpcqibal.supabase.co';
    var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd2tkanJvemp0dmRwY3FpYmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMDc4MzAsImV4cCI6MjEwOTU4MzgzMH0._8V57fGwsuVb-h5mRNhVWrBnOC4LpwMC-4MJzf4kIkw';
    var H = { apikey: KEY, Authorization: 'Bearer ' + KEY };
    if (window.fetch) {
      Promise.all([
        fetch(URL + '/rest/v1/packages?select=id,name,umrah_count,sla_hours,enabled,seasonal,allows_dua,priority,sort&order=sort', { headers: H }).then(function (r) { return r.ok ? r.json() : Promise.reject(); }),
        fetch(URL + '/rest/v1/package_prices?select=package_id,currency,price', { headers: H }).then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      ]).then(function (res) {
        var pk = res[0], pr = res[1];
        if (!Array.isArray(pk) || !pk.length || !Array.isArray(pr) || !pr.length) return;
        var prices = {};
        pr.forEach(function (x) { (prices[x.package_id] = prices[x.package_id] || {})[x.currency] = Number(x.price); });
        data = { packages: pk, prices: prices };
        live = true;
        renderPkgs();
      }).catch(function () { /* نبقى على النسخة الاحتياطية */ });
    }
  }

  /* نموذج التواصل: يفتح واتساب أو البريد برسالة جاهزة، بدون خادم */
  var cf = document.getElementById('contact-form');
  if (cf) {
    cf.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = new FormData(cf);
      var name = (f.get('name') || '').toString().trim();
      var topic = (f.get('topic') || '').toString();
      var msg = (f.get('message') || '').toString().trim();
      var via = (f.get('via') || 'wa').toString();
      var text = 'السلام عليكم، أنا ' + name + '.\nالموضوع: ' + topic + '\n\n' + msg;
      if (via === 'mail') {
        location.href = 'mailto:support@umratuhum.com?subject=' + encodeURIComponent('عمرتهم — ' + topic) + '&body=' + encodeURIComponent(text);
      } else {
        window.open('https://wa.me/' + cf.dataset.wa + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
    });
  }

  /* السنة في التذييل */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
