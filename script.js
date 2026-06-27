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
