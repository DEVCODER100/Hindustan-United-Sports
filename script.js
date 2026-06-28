// ===== Mobile nav =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});
mainNav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  })
);

// ===== Scroll reveal =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.section-head,.feature-card,.program-card,.ground-card,.coach-card,.resource-card,.gallery-grid figure')
  .forEach(el => io.observe(el));

// ===== AI Coach (rule-based demo assistant) =====
const aiForm = document.getElementById('aiForm');
const aiText = document.getElementById('aiText');
const aiMessages = document.getElementById('aiMessages');
const aiQuick = document.getElementById('aiQuick');

const KNOWLEDGE = [
  { k: ['shoot', 'finish', 'goal', 'striker'],
    a: "Try the Corner Placement drill: place targets in the top & bottom corners and take 20 shots from the edge of the box — 10 with the inside of the foot for placement, 10 driven. Focus on a planted, balanced standing foot." },
  { k: ['dribbl', 'control', 'touch', '1v1'],
    a: "Set up a 10-cone slalom and dribble through using both feet. Do 3 sets focusing on close touches, then 3 sets at full speed. Add a 1v1 finish at the end to keep it game-realistic." },
  { k: ['pass', 'vision', 'distribut'],
    a: "Work on a triangle passing drill with two partners: one-touch passing for 2 minutes each direction, then switch to driven long passes. Keep your head up and call before you receive." },
  { k: ['stamina', 'fit', 'endur', 'cardio', 'run'],
    a: "Build stamina with interval running: 6 × (40s sprint / 60s jog), 3 times a week. Combine with small-sided games — they improve match-specific fitness better than steady jogging." },
  { k: ['diet', 'eat', 'nutri', 'food', 'meal'],
    a: "Pre-match (2–3 hrs before): complex carbs like rice, pasta or oats with lean protein. Hydrate well. Post-match: protein + carbs within 45 mins (e.g. eggs/chicken with fruit) to aid recovery. Avoid heavy fried food on match day." },
  { k: ['tactic', 'position', 'formation', 'defend', 'mark'],
    a: "Positioning tip: stay compact when defending and scan every few seconds to know where space and opponents are. For your role, focus on body shape — open up so you can see the whole pitch when receiving." },
  { k: ['warm', 'stretch', 'injur', 'recover'],
    a: "Always do a 10-min dynamic warm-up (leg swings, lunges, high knees) before training and static stretching + light jog as a cool-down. Sleep 8 hrs and hydrate to prevent injuries." },
  { k: ['trial', 'join', 'enroll', 'book', 'fee', 'price'],
    a: "Great! You can book a free trial on WhatsApp at +91 76228 56323. Tell us the player's age and we'll match you to the right program and ground." },
];

function reply(text) {
  const t = text.toLowerCase();
  const hit = KNOWLEDGE.find(item => item.k.some(w => t.includes(w)));
  return hit ? hit.a
    : "Good question! I can help with drills, fitness, diet and tactics. Try asking about shooting, dribbling, stamina or pre-match meals — or book a free trial at +91 76228 56323.";
}

function addMsg(text, who) {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

function ask(question) {
  addMsg(question, 'user');
  const typing = addMsg('…', 'bot');
  setTimeout(() => { typing.textContent = reply(question); aiMessages.scrollTop = aiMessages.scrollHeight; }, 550);
}

aiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = aiText.value.trim();
  if (!q) return;
  ask(q);
  aiText.value = '';
});

aiQuick.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => ask(b.dataset.q))
);

// ===== Header shadow on scroll =====
const header = document.querySelector('.site-header');
addEventListener('scroll', () => {
  header.style.boxShadow = scrollY > 8 ? '0 8px 24px -16px rgba(0,0,0,.35)' : 'none';
});

// ===== Training / Drills engine =====
const DATA = (typeof DATA_ACADEMY_REPOSITORY !== 'undefined') ? DATA_ACADEMY_REPOSITORY : null;
const grid = document.getElementById('drillsGrid');

if (DATA && grid) {
  const tabsEl = document.getElementById('trainingTabs');
  const filtersEl = document.getElementById('drillFilters');
  const moreBtn = document.getElementById('drillsMoreBtn');
  const moreWrap = moreBtn ? moreBtn.parentElement : null;

  const billboard = {
    badge: document.getElementById('billboard-badge'),
    title: document.getElementById('billboard-title'),
    desc: document.getElementById('billboard-desc'),
    meta: document.getElementById('billboard-meta'),
  };

  let mode = 'drills';      // active tab
  let category = 'all';     // active drill filter
  let expanded = false;     // show-all toggle
  const LIMIT = 9;

  const titleCase = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  function setBillboard(key) {
    const b = DATA[key] && DATA[key].billboard;
    if (!b) return;
    // Drills tab: auto-rotate a random drill into the billboard each render
    if (key === 'drills') {
      const cards = DATA.drills.cards;
      const r = cards[Math.floor(Math.random() * cards.length)];
      billboard.badge.innerHTML = '<i class="dot"></i> TODAY\'S DRILL · AUTO-ROTATING';
      billboard.title.textContent = r.title;
      billboard.desc.textContent = r.desc;
      billboard.meta.innerHTML = [titleCase(r.category), r.time, r.diff].map(m => `<span>${m}</span>`).join('');
      return;
    }
    billboard.badge.innerHTML = '<i class="dot"></i> ' + b.badge.replace(/<[^>]*>/g, '').trim();
    billboard.title.textContent = b.title;
    billboard.desc.textContent = b.desc;
    billboard.meta.innerHTML = (b.meta || []).map(m => `<span>${m}</span>`).join('');
  }

  function cardHTML(card) {
    const clickable = card.id ? `data-id="${card.id}" tabindex="0" role="button"` : '';
    return `
      <article class="drill-card ${card.id ? 'is-clickable' : ''}" ${clickable}>
        <div class="drill-card-top">
          <h4>${card.title}</h4>
          <p>${card.desc}</p>
        </div>
        <div class="drill-card-foot">
          <span class="badge-time">⏱ ${card.time}</span>
          <span class="badge-diff ${card.class || 'bd-intermediate'}">${card.diff}</span>
        </div>
      </article>`;
  }

  function visibleCards() {
    let cards = DATA[mode].cards.slice();
    if (mode === 'drills' && category !== 'all') {
      cards = cards.filter(c => c.category === category);
    }
    return cards;
  }

  function render() {
    setBillboard(mode);
    const all = visibleCards();
    const showAll = expanded || mode !== 'drills';
    const shown = showAll ? all : all.slice(0, LIMIT);

    grid.innerHTML = shown.length
      ? shown.map(cardHTML).join('')
      : `<p class="drills-empty">No resources available for this selection.</p>`;

    // wire clicks
    grid.querySelectorAll('.drill-card.is-clickable').forEach(el => {
      el.addEventListener('click', () => openDrill(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') openDrill(el.dataset.id); });
    });

    // show/hide "view all"
    if (moreWrap) {
      if (mode === 'drills' && all.length > LIMIT) {
        moreWrap.style.display = 'flex';
        moreBtn.textContent = expanded ? 'Show Less' : `View All Drills (${all.length})`;
      } else {
        moreWrap.style.display = 'none';
      }
    }
    // filter chips only for drills tab
    if (filtersEl) filtersEl.style.display = (mode === 'drills') ? 'flex' : 'none';
  }

  // Tabs
  if (tabsEl) tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    tabsEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.tab;
    expanded = false;
    render();
  });

  // Filter chips
  if (filtersEl) filtersEl.addEventListener('click', e => {
    const chip = e.target.closest('span[data-cat]');
    if (!chip) return;
    filtersEl.querySelectorAll('span').forEach(s => s.classList.remove('active'));
    chip.classList.add('active');
    category = chip.dataset.cat;
    expanded = false;
    render();
  });

  // View all toggle
  if (moreBtn) moreBtn.addEventListener('click', () => { expanded = !expanded; render(); });

  // ----- Modal -----
  const modal = document.getElementById('drillModal');
  const mCat = document.getElementById('modalCat');
  const mTitle = document.getElementById('modalTitle');
  const mDesc = document.getElementById('modalDesc');
  const mPills = document.getElementById('modalPills');
  const mSteps = document.getElementById('modalSteps');

  function openDrill(id) {
    const d = DATA.drills.cards.find(c => c.id === id);
    if (!d) return;
    mCat.textContent = titleCase(d.category);
    mTitle.textContent = d.title;
    mDesc.textContent = d.desc;
    mPills.innerHTML = `
      <span class="m-pill m-time">⏱ ${d.time}</span>
      <span class="m-pill ${d.class || 'bd-intermediate'}">${d.diff}</span>
      <span class="m-pill m-pos">👥 ${d.positions || 'All Roles'}</span>`;
    mSteps.innerHTML = (d.steps && d.steps.length)
      ? d.steps.map((s, i) => `
        <div class="m-step"><span class="m-step-no">${i + 1}</span><p>${s}</p></div>`).join('')
      : `<p class="drills-empty">Technical configurations are managed live by academy field leaders.</p>`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeDrill() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  document.getElementById('modalClose').addEventListener('click', closeDrill);
  modal.addEventListener('click', e => { if (e.target === modal) closeDrill(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDrill(); });

  render();
}
