const root = document.querySelector('#app');

const days = [
  { short: 'MON', date: '12', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift' },
  { short: 'TUE', date: '13', title: 'Rest day', time: 'A little room to reset', type: 'Off' },
  { short: 'WED', date: '14', title: 'Night shift', time: '19:00 – 07:30', type: 'Night Shift' },
  { short: 'THU', date: '15', title: 'Night shift', time: '19:00 – 07:30', type: 'Night Shift' },
  { short: 'FRI', date: '16', title: 'Rest day', time: 'Recovery day', type: 'Off' },
  { short: 'SAT', date: '17', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift' },
  { short: 'SUN', date: '18', title: 'Rest day', time: 'No shift planned', type: 'Off' },
];

const state = {
  page: 'onboarding', step: 0, workPattern: 'Rotating shifts', rosterMethod: 'Enter shifts manually',
  tab: 'Today', scheduleView: 'Week', selectedDate: '15', month: 'October 2026',
  mood: '', sleep: 6.5, sleepSource: 'Enter manually', cycle: false,
  notifications: { 'Shift reminders': true, 'Sleep window reminders': false, 'Weekly recovery summary': true },
  shifts: [...days], showAddShift: false, toastTimer: null,
};

const symbols = { Today: '◉', Schedule: '▦', Recovery: '☾', Profile: '○' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function statusBar() {
  return `<div class="statusbar"><span>9:41</span><span class="status-icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span></div>`;
}

function header() {
  return `<header class="app-header"><div class="brand">circadia</div><button class="icon-button" data-action="profile" aria-label="Open profile">◌</button></header>`;
}

function nav() {
  return `<nav class="bottom-nav" aria-label="Main navigation">${['Today', 'Schedule', 'Recovery', 'Profile'].map((name) => `<button class="nav-item ${state.tab === name ? 'active' : ''}" data-page="${name}"><span class="nav-icon">${symbols[name]}</span><span>${name}</span></button>`).join('')}</nav>`;
}

function progress(step) {
  return `<div class="progress" aria-label="Step ${step + 1} of 4">${[0, 1, 2, 3].map((i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div><p class="progress-copy">STEP ${step + 1} OF 4</p>`;
}

function actionButtons(primary, secondary = 'Back') {
  return `<button class="btn" data-action="next">${primary} <span aria-hidden="true">→</span></button><button class="btn ghost" data-action="back">← ${secondary}</button>`;
}

function onboarding() {
  const top = `<p class="eyebrow">${state.step === 0 ? 'A calmer rhythm starts here' : state.step === 1 ? 'First, a little about you' : state.step === 2 ? 'Your plan starts here' : 'Your next few shifts'}</p>`;
  if (state.step === 0) return `${progress(0)}${top}<h1>More room for your life between shifts.</h1><p class="subhead">Circadia helps you find time for sleep and recovery around the hours you work.</p><div class="card mint"><p class="eyebrow">BUILT FOR ROTATING SHIFTS</p><h3>Care that moves with your schedule.</h3><p class="fine">A practical, gentle guide to the rest between work.</p></div><div style="height:14px"></div><button class="btn" data-action="next">Set up my schedule <span>→</span></button><button class="btn ghost" data-action="explore">Explore the app</button>`;
  if (state.step === 1) {
    const patterns = [['Day shifts', 'Mostly daytime hours', '☀'], ['Night shifts', 'Mostly overnight hours', '☾'], ['Rotating shifts', 'Different shifts across the week', '◷']];
    return `${progress(1)}${top}<h1>What kind of shifts do you work?</h1><p class="subhead">We’ll shape your preview around the way you work.</p>${patterns.map(([name, detail, icon]) => `<button class="option ${state.workPattern === name ? 'selected' : ''}" data-select-pattern="${name}"><span class="option-copy"><span class="option-icon">${icon}</span><span><strong>${name}</strong><small>${detail}</small></span></span><span class="radio"></span></button>`).join('')}<p class="helper">We’ll use your upcoming shifts to time your sleep and recovery guidance.</p>${actionButtons('Continue')}`;
  }
  if (state.step === 2) {
    const methods = [['Connect a calendar', 'Connect an existing work calendar', '▦'], ['Enter shifts manually', 'Add the next few shifts yourself', '＋'], ['Upload a schedule', 'Use a schedule image or document', '↥']];
    return `${progress(2)}${top}<h1>Add your upcoming shifts.</h1><p class="subhead">Choose the easiest way to add your roster. You can change it any time.</p>${methods.map(([name, detail, icon]) => `<button class="option ${state.rosterMethod === name ? 'selected' : ''}" data-select-method="${name}"><span class="option-copy"><span class="option-icon">${icon}</span><span><strong>${name}</strong><small>${detail}</small></span></span><span class="radio"></span></button>`).join('')}<p class="helper">Your roster stays yours. You can edit or remove shifts whenever plans change.</p>${actionButtons('Continue')}`;
  }
  return `${progress(3)}${top}<h1>Enter your roster.</h1><p class="subhead">A few upcoming shifts are enough to get started.</p><div class="card">${state.shifts.slice(0, 3).map((shift, i) => shiftEditor(shift, i)).join('')}</div><button class="btn secondary" data-action="add-row">＋ Add another shift</button><div style="height:11px"></div>${actionButtons('Finish setup')}`;
}

function shiftEditor(shift, i) {
  return `<div class="shift-row"><span class="date-badge">${escapeHtml(shift.short)}<br>${escapeHtml(shift.date)}</span><span><strong>${escapeHtml(shift.title)}</strong><small>${escapeHtml(shift.time)}</small></span><button class="link-button" data-action="add-shift" aria-label="Add a shift">＋</button></div>`;
}

function timeline() {
  const lanes = [['Sleep', '09:00–15:30 · Sleep', 'sleep'], ['Night shift', '19:00–07:30 · Shift', 'shift'], ['Light example', '17:00–18:30 · Light', 'light'], ['Nap example', '15:30–17:00 · Nap', 'nap']];
  return `<div class="card deep"><p class="eyebrow">SHIFT-AWARE OVERVIEW</p><h2>Your 24-hour rhythm</h2><p class="fine" style="color:var(--lime); margin-bottom:10px">24-hour scale&nbsp; · &nbsp;NOW 17:56</p><div class="timeline-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>${lanes.map(([name, time, tone]) => `<div class="lane"><div class="lane-label"><span>${name}</span><span>${time}</span></div><div class="track"><i class="segment ${tone}"></i></div></div>`).join('')}<p class="fine" style="margin-top:14px">Your night shift runs 19:00–07:30 on Fri, Oct 16. Plan time for rest and prepare for work around the rest of your day.</p></div>`;
}

function today() {
  return `<p class="eyebrow">THURSDAY, OCTOBER 15</p><h1>Good afternoon, Jamie.</h1><p class="subhead">A little support for your next shift.</p><div class="card lime"><div class="card-title-row"><p class="eyebrow">NEXT SHIFT</p><span class="pill dark">◷ &nbsp; Night Shift</span></div><h2 style="font-size:20px;margin:0 0 4px">19:00 – 07:30</h2><p class="fine" style="color:var(--ink)">Thu, Oct 15 · starts in 1h 04m</p></div><div class="card"><div class="card-title-row"><p class="eyebrow">REST PLAN</p><span class="pill">After work</span></div><h2>Your sleep window</h2><p class="strong-time">09:00 - 15:30</p><span class="pill aqua">6h 30m</span><p class="fine" style="margin-top:9px">Plan time to rest after work and before your next commitment.</p></div>${timeline()}<div class="section-heading"><p class="eyebrow">AROUND YOUR SHIFT</p><h2>One useful next step</h2></div>${[['☼', 'LIGHT', 'Plan your light exposure', 'Think about the light you’ll have at work and on your commute.'], ['☕', 'CAFFEINE', 'Check in on caffeine', 'Notice when you have caffeine and how it affects your rest later.'], ['⌁', 'NAP', 'Make room for a nap', 'If you plan to nap, leave yourself time to wake before heading in.']].map(([icon, label, title, detail]) => `<div class="card steps-card"><span class="step-icon">${icon}</span><div><p class="eyebrow">${label}</p><h3>${title}</h3><p>${detail}</p></div></div>`).join('')}<div class="card mint"><p class="eyebrow">RECOVERY</p><h3>Build your sleep picture</h3><p class="fine">Add a sleep check-in after your next rest. Your recent entries will appear here.</p><button class="link-button" data-page="Recovery">View recovery →</button></div>`;
}

function weekCalendar() {
  return `<div class="days">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => `<span class="day-head">${day}</span>`).join('')}${state.shifts.map((shift) => `<button class="day-cell ${state.selectedDate === shift.date ? 'selected' : ''}" data-select-day="${shift.date}"><span>${shift.date}</span>${shift.type !== 'Off' ? '<i class="dot"></i>' : ''}</button>`).join('')}</div>`;
}

function monthCalendar() {
  const cells = Array.from({ length: 35 }, (_, index) => {
    const firstWeekday = (new Date(2026, 9, 1).getDay() + 6) % 7;
    const currentDate = index - firstWeekday + 1;
    const outside = currentDate < 1 || currentDate > 31;
    const date = outside ? new Date(2026, currentDate < 1 ? 8 : 10, currentDate < 1 ? currentDate + 1 : currentDate - 31).getDate() : currentDate;
    const dateStr = String(date).padStart(2, '0');
    const shift = state.shifts.find((item) => item.date === dateStr);
    return `<button class="day-cell ${state.selectedDate === dateStr ? 'selected' : ''}" data-select-day="${dateStr}" style="${outside ? 'opacity:.35' : ''}"><span>${date}</span>${shift && shift.type !== 'Off' ? '<i class="dot"></i>' : ''}</button>`;
  }).join('');
  return `<div class="days">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => `<span class="day-head">${day}</span>`).join('')}${cells}</div>`;
}

function schedule() {
  const selected = state.shifts.find((shift) => shift.date === state.selectedDate) || state.shifts[3];
  return `<div class="card-title-row"><div><p class="eyebrow">YOUR ROSTER</p><h1 style="margin:0">Schedule</h1></div><button class="icon-button" data-action="add-shift" aria-label="Add shift">＋</button></div><div class="card"><div class="card-title-row"><h3 style="margin:0">${state.month}</h3><div class="segmented"><button class="segment-button ${state.scheduleView === 'Week' ? 'active' : ''}" data-view="Week">Week</button><button class="segment-button ${state.scheduleView === 'Month' ? 'active' : ''}" data-view="Month">Month</button></div></div>${state.scheduleView === 'Week' ? weekCalendar() : monthCalendar()}</div><div class="section-heading"><p class="eyebrow">${state.scheduleView === 'Week' ? 'THIS WEEK' : 'SELECTED DAY'}</p><h2>${selected.short}, Oct ${Number(selected.date)}</h2></div><div class="card"><div class="shift-row"><span class="date-badge">${selected.short}<br>${selected.date}</span><span><strong>${selected.title}</strong><small>${selected.time}</small></span><span class="pill ${selected.type === 'Night Shift' ? 'blue' : selected.type === 'Day Shift' ? 'aqua' : ''}">${selected.type === 'Off' ? 'Rest' : selected.type}</span></div><p class="fine" style="margin-top:10px">Circadia can use this shift to suggest a rest window and recovery check-in.</p></div><button class="btn secondary" data-action="add-shift">＋ Add a shift</button>`;
}

function recovery() {
  const feelings = ['Energized', 'Calm', 'Okay', 'Sleepy', 'Stressed', 'Irritated'];
  return `<p class="eyebrow">A GENTLER WAY TO TRACK</p><h1>Recovery</h1><p class="subhead">Small check-ins help you notice what works for you over time.</p><div class="card mint"><p class="eyebrow">YOUR PERSONAL PATTERNS</p><h3>Patterns take time.</h3><p class="fine">There’s no right score. Your check-ins are a private way to see how you’re doing.</p></div><div class="card"><p class="eyebrow">ONE-TAP CHECK-IN</p><h3>How are you feeling right now?</h3><div class="mood-grid">${feelings.map((feeling) => `<button class="mood ${state.mood === feeling ? 'selected' : ''}" data-mood="${feeling}">${feeling}</button>`).join('')}</div></div><div class="card"><p class="eyebrow">SLEEP TRACKER</p><h3>How much did you sleep?</h3><p class="fine" style="margin-bottom:12px">Add a recent rest period when you’re ready.</p><div class="card-title-row"><div class="segmented"><button class="segment-button ${state.sleepSource === 'Enter manually' ? 'active' : ''}" data-sleep-source="Enter manually">Enter manually</button><button class="segment-button ${state.sleepSource === 'Wearable' ? 'active' : ''}" data-sleep-source="Wearable">Wearable</button></div></div><div class="range-row"><span class="sleep-hours">${Number(state.sleep).toFixed(1)}h</span><input aria-label="Hours slept" type="range" min="0" max="12" step="0.5" value="${state.sleep}" data-sleep-range></div><div style="height:12px"></div><button class="btn" data-action="save-sleep">Save sleep check-in</button></div><div class="card"><p class="eyebrow">OPTIONAL · PRIVATE</p><div class="toggle-row"><span><strong>Cycle tracking</strong><small>Include cycle notes in your recovery view.</small></span><button class="switch ${state.cycle ? 'on' : ''}" data-toggle-cycle aria-label="Toggle cycle tracking"></button></div><button class="btn secondary" style="margin-top:12px" data-action="log-day">＋ Log today</button></div><div class="card"><p class="eyebrow">RECENT TREND</p><h3>Your sleep history starts here.</h3><p class="fine">Your saved check-ins will build a picture over time.</p></div>`;
}

function preference(label, detail, on) {
  return `<div class="toggle-row"><span><strong>${label}</strong><small>${detail}</small></span><button class="switch ${on ? 'on' : ''}" data-toggle-pref="${label}" aria-label="Toggle ${label}"></button></div>`;
}

function profile() {
  const entries = Object.entries(state.notifications);
  return `<p class="eyebrow">YOUR SPACE, YOUR CHOICES</p><h1>Profile</h1><p class="subhead">Make Circadia feel a little more like yours.</p><div class="card" style="display:flex;align-items:center;gap:12px"><span class="step-icon" style="border-radius:50%;width:38px;height:38px;font-weight:700;color:var(--ink)">J</span><span><strong>Jamie Morgan</strong><small class="fine" style="display:block">Registered nurse · Rotating shifts</small></span><button class="link-button" style="margin-left:auto" data-action="edit-profile">Edit</button></div><p class="eyebrow" style="margin-top:21px">PREFERENCES</p><div class="card">${entries.map(([label, on]) => preference(label, label === 'Shift reminders' ? 'A heads-up before your shift begins.' : label === 'Sleep window reminders' ? 'A gentle reminder when it’s time to rest.' : 'A short look at your week, when you want it.', on)).join('')}</div><p class="eyebrow">YOUR PLAN</p><div class="card">${preference('Shift pattern', state.workPattern, true)}${preference('Sleep tracking', 'Manual entry · No wearable connected', true)}<button class="link-button" data-action="restart">Review onboarding →</button></div><p class="tiny-label" style="text-align:center;margin:19px 0">Circadia is a prototype for planning and reflection.</p>`;
}

function modal() {
  if (!state.showAddShift) return '';
  return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">Add a shift</h2><button class="close-button" data-action="close-modal" aria-label="Close">×</button></div><p class="helper">Add an upcoming shift to your roster.</p><label class="field-label">Date<input class="field" type="date" id="shift-date" value="2026-10-19"></label><label class="field-label">Shift type<select class="field" id="shift-type"><option>Day shift</option><option>Night shift</option><option>Rest day</option></select></label><div class="field-row"><label class="field-label">Starts<input class="field" type="time" id="shift-start" value="19:00"></label><label class="field-label">Ends<input class="field" type="time" id="shift-end" value="07:30"></label></div><div style="height:10px"></div><button class="btn" data-action="save-shift">Save shift</button></section></div>`;
}

function pageContent() {
  if (state.page === 'onboarding') return onboarding();
  if (state.page === 'Today') return today();
  if (state.page === 'Schedule') return schedule();
  if (state.page === 'Recovery') return recovery();
  return profile();
}

function render() {
  const onboardingPage = state.page === 'onboarding';
  root.innerHTML = `<div class="shell"><section class="app-frame" aria-label="Circadia shift-aware recovery prototype">${statusBar()}${onboardingPage ? '' : header()}<div class="screen ${onboardingPage ? 'onboarding' : ''}">${pageContent()}</div>${onboardingPage ? '' : nav()}<div class="toast" id="toast" role="status"></div>${modal()}</section></div>`;
}

function toast(message) {
  const element = document.querySelector('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => element.classList.remove('show'), 2200);
}

function finishOnboarding() {
  state.page = 'Today';
  state.tab = 'Today';
}

function addShift() {
  const value = document.querySelector('#shift-date')?.value || '2026-10-19';
  const type = document.querySelector('#shift-type')?.value || 'Night shift';
  const start = document.querySelector('#shift-start')?.value || '19:00';
  const end = document.querySelector('#shift-end')?.value || '07:30';
  const [year, month, day] = value.split('-').map(Number);
  const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(year, month - 1, day)).toUpperCase();
  const record = { short: weekday, date: String(day).padStart(2, '0'), title: type === 'Rest day' ? 'Rest day' : type, time: type === 'Rest day' ? 'Recovery day' : `${start} – ${end}`, type: type === 'Rest day' ? 'Off' : type };
  const old = state.shifts.findIndex((item) => item.date === record.date);
  if (old >= 0) state.shifts[old] = record; else state.shifts.push(record);
  state.shifts.sort((a, b) => Number(a.date) - Number(b.date));
  state.selectedDate = record.date;
  state.showAddShift = false;
  render();
  toast('Shift added to your roster');
}

root.addEventListener('input', (event) => {
  if (event.target.matches('[data-sleep-range]')) {
    state.sleep = Number(event.target.value);
    const display = event.target.parentElement.querySelector('.sleep-hours');
    if (display) display.textContent = `${state.sleep.toFixed(1)}h`;
  }
});

root.addEventListener('click', (event) => {
  const target = event.target.closest('button, [data-action="modal-backdrop"]');
  if (!target) return;
  if (target.dataset.page) {
    state.page = target.dataset.page; state.tab = target.dataset.page; render(); return;
  }
  if (target.dataset.selectPattern) { state.workPattern = target.dataset.selectPattern; render(); return; }
  if (target.dataset.selectMethod) { state.rosterMethod = target.dataset.selectMethod; render(); return; }
  if (target.dataset.view) { state.scheduleView = target.dataset.view; render(); return; }
  if (target.dataset.selectDay) { state.selectedDate = target.dataset.selectDay; render(); return; }
  if (target.dataset.mood) { state.mood = target.dataset.mood; render(); toast(`Check-in saved: ${state.mood.toLowerCase()}`); return; }
  if (target.dataset.sleepSource) { state.sleepSource = target.dataset.sleepSource; render(); return; }
  if (target.hasAttribute('data-toggle-cycle')) { state.cycle = !state.cycle; render(); toast(state.cycle ? 'Cycle tracking enabled' : 'Cycle tracking paused'); return; }
  if (target.dataset.togglePref) { state.notifications[target.dataset.togglePref] = !state.notifications[target.dataset.togglePref]; render(); return; }
  const action = target.dataset.action;
  if (action === 'profile') { state.page = 'Profile'; state.tab = 'Profile'; render(); return; }
  if (action === 'explore') { finishOnboarding(); render(); return; }
  if (action === 'next') {
    if (state.step < 3) state.step += 1; else finishOnboarding();
    render(); return;
  }
  if (action === 'back') { if (state.step > 0) state.step -= 1; render(); return; }
  if (action === 'add-row') {
    state.shifts.push({ short: 'SUN', date: '19', title: 'Night shift', time: '19:00 – 07:30', type: 'Night Shift' });
    render(); return;
  }
  if (action === 'add-shift') { state.showAddShift = true; render(); return; }
  if (action === 'close-modal') { state.showAddShift = false; render(); return; }
  if (action === 'modal-backdrop' && target === event.target) { state.showAddShift = false; render(); return; }
  if (action === 'save-shift') { addShift(); return; }
  if (action === 'save-sleep') { toast(`${state.sleep.toFixed(1)} hours saved`); return; }
  if (action === 'log-day') { toast('Today’s note is ready to add'); return; }
  if (action === 'edit-profile') { toast('Profile editing is part of this prototype'); return; }
  if (action === 'restart') { state.page = 'onboarding'; state.step = 0; render(); return; }
  if (action === 'edit-shift') { state.page = 'Schedule'; state.tab = 'Schedule'; state.showAddShift = true; render(); }
});

render();

