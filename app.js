const root = document.querySelector('#app');

const days = [
  { short: 'MON', date: '12', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift' },
  { short: 'TUE', date: '13', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift' },
  { short: 'WED', date: '14', title: 'Night shift', time: '19:00 – 07:00', type: 'Night Shift' },
  { short: 'THU', date: '15', title: 'Night shift', time: '19:00 – 07:30', type: 'Night Shift' },
  { short: 'FRI', date: '16', title: 'Night shift', time: '19:00 – 07:00', type: 'Night Shift' },
  { short: 'SAT', date: '17', title: 'Day off', time: 'Recovery day', type: 'Off' },
  { short: 'SUN', date: '18', title: 'Rest day', time: 'No shift planned', type: 'Off' },
];

const state = {
  page: 'onboarding', step: 0, workPattern: 'Rotating shifts', rosterMethod: 'Enter shifts manually',
  tab: 'Today', scheduleView: 'Week', selectedDate: '15', month: 'October 2026',
  mood: 'Sleepy', sleep: 6, sleepSource: 'Enter manually', cycle: true,
  notifications: { 'Notifications': true, 'Shift reminders': true, 'Sleep preferences': true },
  shifts: [...days], showAddShift: false, pageBeforeAdd: 'Schedule', newShiftType: 'night', toastTimer: null,
};

const symbols = { Today: '☼', Schedule: '▦', Recovery: '♡', Profile: '♙' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function statusBar() {
  return `<div class="statusbar"><span>9:41</span><span class="status-icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span></div>`;
}

function header() {
  return `<header class="app-header"><div class="brand">circadia</div><button class="icon-button bell-button" data-action="profile" aria-label="Notifications">♧</button></header>`;
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
  if (state.step === 0) return `${progress(0)}<p class="eyebrow">PERSONAL SUPPORT FOR SHIFT WORK</p><h1>Your shifts change. Your recovery plan adapts.</h1><p class="subhead">Practical sleep and recovery support shaped around the shifts you actually work.</p><div class="card callout-blue"><span class="callout-icon">◉</span><div><p class="eyebrow">BUILT FOR ROTATING SHIFTS</p><p class="fine">A calmer rhythm for life between shifts.</p></div></div><button class="btn" data-action="next">Set up my schedule <span>→</span></button>`;
  if (state.step === 1) {
    const patterns = [['Day shifts', 'Mostly daytime hours', '☀'], ['Night shifts', 'Mostly overnight hours', '☾'], ['Rotating shifts', 'Different shifts across the week', '◷']];
    return `${progress(1)}<p class="eyebrow">FIRST, A LITTLE ABOUT YOU</p><h1>What kind of shifts do you work?</h1><p class="subhead">We’ll shape your preview around the way you work.</p>${patterns.map(([name, detail, icon]) => `<button class="option ${state.workPattern === name ? 'selected' : ''}" data-select-pattern="${name}"><span class="option-copy"><span class="option-icon">${icon}</span><span><strong>${name}</strong><small>${detail}</small></span></span><span class="radio"></span></button>`).join('')}<p class="helper">We’ll use your upcoming shifts to time your sleep and recovery guidance.</p><button class="btn" data-action="next">Continue <span>→</span></button><button class="btn ghost" data-action="back">← Back</button>`;
  }
  if (state.step === 2) {
    const methods = [['Connect your calendar', 'Automatically import your upcoming shifts.', '▦'], ['Enter shifts manually', 'Add shifts yourself, one by one.', '＋'], ['Upload a schedule', 'Upload your photo, screenshot, PDF, spreadsheet or WhatsApp screenshot.', '↥']];
    return `${progress(2)}<p class="eyebrow">YOUR PLAN STARTS HERE</p><h1>Add your upcoming shifts.</h1><p class="subhead">Choose how you received your schedule.</p>${methods.map(([name, detail, icon]) => `<button class="option ${state.rosterMethod === name ? 'selected' : ''}" data-select-method="${name}"><span class="option-copy"><span class="option-icon">${icon}</span><span><strong>${name}</strong><small>${detail}</small></span></span><span class="radio"></span></button>`).join('')}<p class="helper">You’ll review every shift before it appears in your plan.</p><button class="btn" data-action="next">Continue <span>→</span></button><button class="btn ghost" data-action="back">← Back</button>`;
  }
  return `${progress(3)}<p class="eyebrow">YOUR NEXT FEW SHIFTS</p><h1>Make it yours.</h1><p class="subhead">Choose a shift to cycle its type, or add another shift. You can update this later.</p><div class="roster-rows">${state.shifts.slice(3).map((shift, i) => shiftEditor(shift, i)).join('')}</div><button class="btn secondary" data-action="add-row">＋ Add another shift</button><div class="card total-card"><p class="eyebrow">ROSTER TOTAL</p><strong>24h scheduled this week</strong></div><button class="btn" data-action="next">Build my plan <span>→</span></button><button class="btn ghost" data-action="back">← Back</button>`;
}

function shiftEditor(shift, i) {
  return `<button class="shift-row editable-shift" data-action="cycle-shift"><span class="date-badge">${escapeHtml(shift.short)}<br>${escapeHtml(shift.date)}</span><span><strong>${escapeHtml(shift.title)}</strong><small>${escapeHtml(shift.time)}</small></span><span class="pill ${shift.type === 'Night Shift' ? 'dark' : shift.type === 'Off' ? 'off' : 'aqua'}">${shift.type === 'Off' ? 'DAY OFF' : shift.type === 'Night Shift' ? '◷ Night' : '☼ Day'}</span><span class="tiny-hours">12h</span></button>`;
}

function timeline() {
  const lanes = [['Sleep', '09:00–15:30 · Sleep', 'sleep'], ['Night shift', '19:00–07:30 · Shift', 'shift'], ['Light example', '17:00–18:30 · Light', 'light'], ['Nap example', '15:30–17:00 · Nap', 'nap']];
  return `<div class="card deep"><p class="eyebrow">SHIFT-AWARE OVERVIEW</p><h2>Your 24-hour rhythm</h2><p class="fine" style="color:var(--lime); margin-bottom:10px">24-hour scale&nbsp; · &nbsp;NOW 17:56</p><div class="timeline-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>${lanes.map(([name, time, tone]) => `<div class="lane"><div class="lane-label"><span>${name}</span><span>${time}</span></div><div class="track"><i class="segment ${tone}"></i></div></div>`).join('')}<p class="fine" style="margin-top:14px">Your night shift runs 19:00–07:30 on Fri, Oct 16. Plan time for rest and prepare for work around the rest of your day.</p></div>`;
}

function today() {
  return `<p class="eyebrow">THURSDAY, OCTOBER 15</p><h1>Good afternoon, Jamie.</h1><p class="subhead">A little support for your next shift.</p><div class="card lime"><div class="card-title-row"><p class="eyebrow">NEXT SHIFT</p><span class="pill dark">◷ Night Shift</span></div><h2 class="shift-time">19:00 – 07:30</h2><p class="fine">Thu, Oct 15 · starts in 1h 04m</p></div><div class="card sleep-window"><div class="card-title-row"><p class="eyebrow">REST PLAN</p><span class="pill">After work</span></div><h2>Your sleep window</h2><p class="strong-time">09:00–15:30</p><span class="pill aqua">6h 30m</span><p class="fine sleep-copy">Plan time to rest after work and before your next commitment.</p></div>${timeline()}<div class="section-heading"><p class="eyebrow">AROUND YOUR SHIFT</p><h2>One useful next step</h2></div>${[['☼', 'LIGHT', 'Plan your light exposure', 'Think about the light you’ll have at work and on your commute.'], ['▯', 'CAFFEINE', 'Check in on caffeine', 'Notice when you have caffeine and how it affects your rest later.'], ['◔', 'NAP', 'Make room for a nap', 'If you plan to nap, leave yourself time to wake before heading in.']].map(([icon, label, title, detail]) => `<div class="card steps-card"><span class="step-icon">${icon}</span><div><p class="eyebrow">${label}</p><h3>${title}</h3><p>${detail}</p></div><span class="open-link">Open →</span></div>`).join('')}<div class="card mint recovery-card"><p class="eyebrow">RECOVERY</p><h3>Build your sleep picture</h3><p class="fine">Add a sleep check-in after your next rest. Your recent entries will appear here.</p><button class="link-button" data-page="Schedule">View Schedule →</button></div>`;
}

function weekCalendar() {
  return `<div class="calendar-nav"><button aria-label="Previous week">‹</button><strong>OCT 12 – OCT 18, 2026</strong><button aria-label="Next week">›</button></div><div class="week-overview"><p class="eyebrow">SCHEDULED THIS WEEK</p><strong>49h</strong><p>5 shifts · scheduled span, breaks not deducted.</p></div>${state.shifts.slice(0, 5).map((shift) => `<button class="schedule-row ${state.selectedDate === shift.date ? 'selected' : ''}" data-select-day="${shift.date}"><span class="date-badge">${shift.short}<b>${Number(shift.date)}</b></span><span class="schedule-label"><strong>${shift.title}</strong><small>${shift.type === 'Off' ? 'No shift planned' : shift.time}</small></span><span class="pill ${shift.type === 'Night Shift' ? 'dark' : shift.type === 'Day Shift' ? 'aqua' : 'off'}">${shift.type === 'Night Shift' ? '◷ Night' : shift.type === 'Day Shift' ? '☼ Day' : 'DAY OFF'}</span>${shift.type !== 'Off' ? '<span class="tiny-hours">12h</span>' : ''}</button>`).join('')}`;
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
  return `<div class="calendar-nav"><button aria-label="Previous month">‹</button><strong>OCTOBER 2026</strong><button aria-label="Next month">›</button></div><div class="weekdays">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => `<span>${day}</span>`).join('')}</div><div class="days">${cells}</div>`;
}

function schedule() {
  return `<p class="eyebrow">YOUR WORK, AT A GLANCE</p><h1>Your schedule</h1><div class="segmented view-switch"><button class="segment-button ${state.scheduleView === 'Week' ? 'active' : ''}" data-view="Week">Week</button><button class="segment-button ${state.scheduleView === 'Month' ? 'active' : ''}" data-view="Month">Month</button></div><p class="subhead schedule-subhead">Plan work, rest and time away.</p><div class="card schedule-card">${state.scheduleView === 'Week' ? weekCalendar() : `<div class="month-overview"><p class="eyebrow">SCHEDULED THIS MONTH</p><strong>104h</strong><p>6 shifts · scheduled span, breaks not deducted.</p></div>${monthCalendar()}`}</div><button class="btn" data-action="add-shift">＋ Add shift</button><div class="card callout-blue schedule-tip"><span class="callout-icon">ⓘ</span><p>Mark a day off or sick in one tap. Your personal schedule stays yours.</p></div>`;
}

function recovery() {
  const feelings = [['Energized', '⚡'], ['Calm', '☼'], ['Okay', '◉'], ['Sleepy', '☾'], ['Stressed', '⌁'], ['Irritated', '♨']];
  return `<p class="eyebrow">A GENTLER WAY TO TRACK</p><h1>Recovery</h1><p class="subhead">Small steps add up over time.</p><div class="card lime pattern-card"><p class="eyebrow">YOUR PERSONAL PATTERNS</p><h3>Patterns take time.</h3><p class="fine">Log sleep and check in over time to see how shifts affect your recovery.</p></div><div class="card"><p class="eyebrow">A QUICK CHECK-IN</p><h3>How are you feeling?</h3><div class="mood-grid">${feelings.map(([feeling, icon]) => `<button class="mood ${state.mood === feeling ? 'selected' : ''}" data-mood="${feeling}"><span>${icon}</span>${feeling}</button>`).join('')}</div></div><div class="card"><p class="eyebrow">SLEEP TRACKER</p><h3>How did you sleep?</h3><p class="fine">Record an estimate or choose a connected source.</p><div class="sleep-reading">${Number(state.sleep).toFixed(0)} hours</div><div class="source-buttons"><button class="source-button ${state.sleepSource === 'Enter manually' ? 'active' : ''}" data-sleep-source="Enter manually">Enter manually</button><button class="source-button ${state.sleepSource === 'Wearable' ? 'active' : ''}" data-sleep-source="Wearable">Apple Health / wearable</button></div><div class="sleep-range"><span>0h</span><input aria-label="Hours slept" type="range" min="0" max="12" step="0.5" value="${state.sleep}" data-sleep-range><span>12h</span></div></div><div class="card"><p class="eyebrow">OPTIONAL · PRIVATE</p><div class="cycle-heading"><span>◌</span><div><h3>Menstrual cycle</h3><p class="fine">Log a period start to help you notice your own patterns alongside shifts and rest.</p></div></div><p class="private-note">This data is never shared with your hospital.</p><button class="btn secondary log-btn" data-action="log-day">＋ Log today</button><div class="privacy-strip">ⓘ &nbsp;This data is private and never shared with your hospital.</div></div><div class="card"><p class="eyebrow">TRENDS</p><h3>Your recent trend</h3><p class="fine">Your sleep check-ins will build a picture of your routine over time. Add a few entries to get started.</p></div>`;
}

function preference(label, detail, on) {
  return `<div class="toggle-row"><span><strong>${label}</strong><small>${detail}</small></span><button class="switch ${on ? 'on' : ''}" data-toggle-pref="${label}" aria-label="Toggle ${label}"></button></div>`;
}

function profile() {
  return `<p class="eyebrow">YOUR SPACE, YOUR CHOICES</p><h1>Profile</h1><p class="subhead">Manage your routine and wellbeing preferences.</p><div class="card person-card"><span class="avatar">J</span><span><strong>Jamie Morgan</strong><small>Registered nurse · Rotating shifts</small></span></div><p class="eyebrow section-label">PREFERENCES</p><div class="card settings-card"><h3>Preferences</h3><p class="fine">Shape your reminders and sleep plan.</p>${profileRow('♧', 'Notifications', 'On', 'notifications')}${profileRow('◷', 'Shift reminders', '1 hour before', 'reminders')}${profileRow('☾', 'Sleep preferences', '', 'sleep-preferences')}</div><div class="card settings-card privacy-card"><h3>Privacy</h3><p class="fine">Your wellbeing information belongs to you.</p>${profileRow('♡', 'Personal Data', 'Private', 'data')}${profileRow('♧', 'Hospital data sharing', 'Off', 'sharing')}</div><p class="tiny-label footer-brand">CIRCADIA · A PERSONAL GUIDE TO SHIFT WORK</p>`;
}

function profileRow(icon, name, value, action) {
  return `<button class="profile-row" data-action="profile-detail" data-detail="${action}"><span class="profile-row-icon">${icon}</span><span>${name}</span><span class="profile-value">${value} <b>›</b></span></button>`;
}

function addShiftPage() {
  return `<p class="eyebrow">YOUR ROSTER</p><h1>Add a shift</h1><div class="card add-form"><label class="field-label">DATE<input class="field" type="date" id="shift-date" value="2026-10-15"></label><label class="field-label">DAY STATUS<div class="status-options">${[['Day','day'],['Night','night'],['Off','off'],['Sick','sick']].map(([label,key]) => `<button class="status-option ${state.newShiftType === key ? `active ${key}` : ''}" data-shift-kind="${key}">${label}</button>`).join('')}</div></label><div class="field-row"><label class="field-label">START<input class="field" type="time" id="shift-start" value="19:00"></label><label class="field-label">END<input class="field" type="time" id="shift-end" value="07:00"></label></div><div class="shift-length-card"><strong>SHIFT LENGTH</strong><b>12h</b><small>Scheduled span · breaks not deducted.</small></div><button class="btn" data-action="save-shift">Save shift <span>✓</span></button></div>`;
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
  if (state.page === 'AddShift') return addShiftPage();
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
  const type = state.newShiftType === 'day' ? 'Day Shift' : state.newShiftType === 'off' ? 'Rest day' : state.newShiftType === 'sick' ? 'Sick day' : 'Night Shift';
  const start = document.querySelector('#shift-start')?.value || '19:00';
  const end = document.querySelector('#shift-end')?.value || '07:30';
  const [year, month, day] = value.split('-').map(Number);
  const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(year, month - 1, day)).toUpperCase();
  const record = { short: weekday, date: String(day).padStart(2, '0'), title: type === 'Rest day' ? 'Day Off' : type, time: type === 'Rest day' ? 'Recovery day' : `${start} – ${end}`, type: type === 'Rest day' ? 'Off' : type === 'Sick day' ? 'Sick' : type };
  const old = state.shifts.findIndex((item) => item.date === record.date);
  if (old >= 0) state.shifts[old] = record; else state.shifts.push(record);
  state.shifts.sort((a, b) => Number(a.date) - Number(b.date));
  state.selectedDate = record.date;
  state.showAddShift = false;
  state.page = 'Schedule';
  state.tab = 'Schedule';
  render();
  toast('Shift added to your roster');
}

root.addEventListener('input', (event) => {
  if (event.target.matches('[data-sleep-range]')) {
    state.sleep = Number(event.target.value);
    const display = root.querySelector('.sleep-reading');
    if (display) display.textContent = `${state.sleep.toFixed(0)} hours`;
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
  if (target.dataset.shiftKind) { state.newShiftType = target.dataset.shiftKind; render(); return; }
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
  if (action === 'add-shift') { state.page = 'AddShift'; state.tab = 'Schedule'; render(); return; }
  if (action === 'cycle-shift') {
    const row = target.closest('.editable-shift');
    const index = [...root.querySelectorAll('.editable-shift')].indexOf(row);
    const shift = state.shifts.slice(3)[index];
    if (shift) {
      if (shift.type === 'Night Shift') Object.assign(shift, { title: 'Day Off', time: 'Recovery day', type: 'Off' });
      else if (shift.type === 'Off') Object.assign(shift, { title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift' });
      else Object.assign(shift, { title: 'Night shift', time: '19:00 – 07:30', type: 'Night Shift' });
      render();
    }
    return;
  }
  if (action === 'close-modal') { state.showAddShift = false; render(); return; }
  if (action === 'modal-backdrop' && target === event.target) { state.showAddShift = false; render(); return; }
  if (action === 'save-shift') { addShift(); return; }
  if (action === 'save-sleep') { toast(`${state.sleep.toFixed(1)} hours saved`); return; }
  if (action === 'log-day') { toast('Today’s note is ready to add'); return; }
  if (action === 'edit-profile') { toast('Profile editing is part of this prototype'); return; }
  if (action === 'profile-detail') { toast(`${target.dataset.detail.replace('-', ' ')} settings`); return; }
  if (action === 'restart') { state.page = 'onboarding'; state.step = 0; render(); return; }
  if (action === 'edit-shift') { state.page = 'Schedule'; state.tab = 'Schedule'; state.showAddShift = true; render(); }
});

render();


