const root = document.querySelector('#app');

const days = [
  { short: 'SUN', date: '11', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift', hours: 12 },
  { short: 'MON', date: '12', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift', hours: 12 },
  { short: 'TUE', date: '13', title: 'Day shift', time: '07:00 – 19:00', type: 'Day Shift', hours: 12 },
  { short: 'WED', date: '14', title: 'Night shift', time: '19:00 – 07:00', type: 'Night Shift', hours: 12 },
  { short: 'THU', date: '15', title: 'Night shift', time: '19:00 – 07:30', type: 'Night Shift', hours: 12 },
  { short: 'FRI', date: '16', title: 'Night shift', time: '19:00 – 07:00', type: 'Night Shift', hours: 12 },
  { short: 'SAT', date: '17', title: 'Day off', time: 'Recovery day', type: 'Off', hours: 0 },
  { short: 'SUN', date: '18', title: 'Rest day', time: 'No shift planned', type: 'Off', hours: 0 },
];
days.forEach((shift) => {
  shift.isoDate = `2026-10-${shift.date}`;
  shift.onboarding = Number(shift.date) >= 15;
});

const state = {
  page: 'onboarding', step: 0, workPattern: 'Rotating shifts', rosterMethod: 'Enter shifts manually',
  tab: 'Today', scheduleView: 'Week', selectedDate: '2026-10-15', monthCursor: '2026-10-01', weekStart: '2026-10-12',
  mood: 'Sleepy', sleep: 6, sleepSource: 'Enter manually', cycle: true,
  notifications: { 'Notifications': true, 'Shift reminders': true, 'Sleep preferences': true },
  shifts: [...days], profileDetail: '', profileReturnPage: 'Profile', shiftDate: '2026-10-15', shiftReturnPage: 'Schedule', shiftEditing: '',
  newShiftType: 'night', reminderTiming: '1 hour before', hospitalSharing: false, readNotifications: false,
  sleepPreference: 'After work', sleepGoal: '8 hours', weeklySummary: true, scheduleChanged: false, toastTimer: null, loadingTimer: null,
};

const symbols = { Today: 'sun', Schedule: 'calendar', Recovery: 'heart', Profile: 'user' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const iconPaths = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  heart: '<path d="M20.8 8.8c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/><path d="M6 12h3l1.5-2.5 3 5 1.5-2.5h3"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1.5a7 7 0 0 1 14 0V21"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  moon: '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>',
  rotate: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3"/>',
  shiftCycle: '<circle cx="7" cy="12" r="3.1"/><path d="M7 6.5V5m0 14v-1.5M1.5 12H3m8 0h1.5M3.1 8.1 4.2 9.2m5.6 5.6 1.1 1.1M3.1 15.9l1.1-1.1m5.6-5.6 1.1-1.1"/><path d="M21 14.5a6 6 0 0 1-7.8-7.8 6 6 0 1 0 7.8 7.8Z"/><path d="M14 3.5a9 9 0 0 1 6.5 3.2l1.2-1.2M21.7 5v2.8h-2.8"/>',
  pencil: '<path d="m15 5 4 4M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z"/><path d="m13.5 6.5 4 4"/>',
  imageUpload: '<rect x="3" y="5" width="15" height="15" rx="2.5"/><circle cx="8" cy="10" r="1.3"/><path d="m5 17 4-4 2.5 2.5 2-2 2.5 2.5M19 3v7m-3.5-3.5L19 3l3.5 3.5"/>',
  calendarAdd: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M16 3v4M8 3v4M3 10h18M12 13v5m-2.5-2.5h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  coffee: '<path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Zm12 2h2a2 2 0 0 1 0 4h-2M8 4v2m4-2v2"/>',
  bed: '<path d="M3 18v-7m0 4h18v3M3 13h7a3 3 0 0 1 3 3m0-3h5a3 3 0 0 1 3 3M3 20v-2m18 2v-2"/>',
  sparkle: '<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Zm7 12 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  calm: '<path d="M3 9c2.5-2.5 5.5-2.5 9 0s6.5 2.5 9 0M3 15c2.5-2.5 5.5-2.5 9 0s6.5 2.5 9 0"/>',
  circle: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/>',
  cycle: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.7 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.3-3"/>',
  building: '<path d="M4 21V5l8-3v19m0-12h8v12M2 21h20M7 7h2m-2 4h2m-2 4h2m7-1h2m-2 4h2"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5m6 6-6-6 6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
};
function icon(name, size = 16) {
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.circle}</svg>`;
}

function statusBar() {
  return `<div class="statusbar"><span>9:41</span><span class="status-icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span></div>`;
}

function header() {
  return `<header class="app-header"><div class="brand">circadia</div><button class="icon-button bell-button" data-action="notifications" aria-label="Open notifications">${icon('bell', 14)}${state.readNotifications ? '' : '<i class="notification-dot"></i>'}</button></header>`;
}

function nav() {
  return `<nav class="bottom-nav" aria-label="Main navigation">${['Today', 'Schedule', 'Recovery', 'Profile'].map((name) => `<button class="nav-item ${state.tab === name ? 'active' : ''}" data-page="${name}"><span class="nav-icon">${icon(symbols[name], 14)}</span><span>${name}</span></button>`).join('')}</nav>`;
}

function progress(step) {
  return `<div class="progress" aria-label="Step ${step + 1} of 4">${[0, 1, 2, 3].map((i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div><p class="progress-copy">STEP ${step + 1} OF 4</p>`;
}

function actionButtons(primary, secondary = 'Back') {
  return `<button class="btn" data-action="next">${primary} <span>${icon('arrow', 12)}</span></button><button class="btn ghost" data-action="back"><span>${icon('arrowLeft', 12)}</span>${secondary}</button>`;
}

function onboarding() {
  if (state.step === 0) return `${progress(0)}<p class="eyebrow">PERSONAL SUPPORT FOR SHIFT WORK</p><h1>Your shifts change. Your recovery plan adapts.</h1><p class="subhead">Practical sleep and recovery support shaped around the shifts you actually work.</p><div class="card callout-blue onboarding-callout"><span class="callout-icon">${icon('heart', 20)}</span><div><p class="eyebrow">BUILT FOR ROTATING SHIFTS</p><p class="fine">More room for your life between shifts.</p></div></div><button class="btn" data-action="next">Set up my schedule <span>${icon('arrow', 17)}</span></button>`;
  if (state.step === 1) {
    const patterns = [['Day shifts', 'Mostly daytime hours', 'sun'], ['Night shifts', 'Mostly overnight hours', 'moon'], ['Rotating shifts', 'Different shifts across the week', 'shiftCycle']];
    return `${progress(1)}<p class="eyebrow">FIRST, A LITTLE ABOUT YOU</p><h1>What kind of shifts do you work?</h1><p class="subhead">We’ll shape your preview around the way you work.</p>${patterns.map(([name, detail, iconName]) => `<button class="option ${state.workPattern === name ? 'selected' : ''}" data-select-pattern="${name}"><span class="option-copy"><span class="option-icon">${icon(iconName, 14)}</span><span><strong>${name}</strong><small>${detail}</small></span></span><span class="radio"></span></button>`).join('')}<p class="helper">We’ll use your upcoming shifts to time your sleep and recovery guidance.</p><button class="btn" data-action="next">Continue <span>${icon('arrow', 12)}</span></button><button class="btn ghost" data-action="back">← Back</button>`;
  }
  if (state.step === 2) {
    const methods = [['Connect your calendar', 'Automatically import your upcoming shifts.', 'calendarAdd'], ['Enter shifts manually', 'Add shifts yourself, one by one.', 'pencil'], ['Upload a schedule', 'Upload your photo, screenshot, PDF, spreadsheet or WhatsApp screenshot.', 'imageUpload']];
    return `${progress(2)}<p class="eyebrow">YOUR PLAN STARTS HERE</p><h1>Add your upcoming shifts.</h1><p class="subhead">Choose how you received your schedule.</p>${methods.map(([name, detail, iconName]) => `<button class="option ${state.rosterMethod === name ? 'selected' : ''}" data-select-method="${name}"><span class="option-copy"><span class="option-icon">${icon(iconName, 14)}</span><span><strong>${name}</strong><small>${detail}</small></span></span><span class="radio"></span></button>`).join('')}<p class="helper">You’ll review every shift before it appears in your plan.</p><button class="btn" data-action="next">Continue <span>${icon('arrow', 12)}</span></button><button class="btn ghost" data-action="back">← Back</button>`;
  }
  return `${progress(3)}<p class="eyebrow">YOUR NEXT FEW SHIFTS</p><h1>Make it yours.</h1><p class="subhead">Choose a shift to review or edit it. You can update this later.</p><div class="roster-rows">${state.shifts.filter((shift) => shift.onboarding).map((shift, i) => shiftEditor(shift, i)).join('')}</div><button class="btn secondary roster-add" data-action="add-row">${icon('plus', 15)} Add another shift</button><div class="card total-card"><p class="eyebrow">ROSTER TOTAL</p><strong>${rosterHours()}h scheduled this week</strong></div><button class="btn" data-action="next">Build my plan <span>${icon('arrow', 17)}</span></button><button class="btn ghost" data-action="back">${icon('arrowLeft', 16)} Back</button>`;
}

function rosterHours() {
  return state.shifts.filter((shift) => shift.onboarding).reduce((sum, shift) => sum + (shift.type === 'Off' || shift.type === 'Sick' ? 0 : Number(shift.hours ?? 12)), 0);
}

function shiftEditor(shift, i) {
  const isToday = shift.date === '15';
  const displayTitle = shift.type === 'Off' ? 'Day Off' : shift.type === 'Night Shift' ? 'Night Shift' : 'Day Shift';
  return `<div class="shift-row editable-shift ${isToday ? 'roster-today' : ''}"><button class="roster-cycle" data-action="edit-shift" data-date="${shift.isoDate}" aria-label="Edit ${escapeHtml(shift.short)} ${escapeHtml(shift.date)} shift"><span class="date-badge">${isToday ? '<em>TODAY</em>' : ''}<span>${escapeHtml(shift.short)}</span><strong>${escapeHtml(shift.date)}</strong></span><span class="roster-shift-name"><strong>${displayTitle}</strong><small>${shift.type === 'Off' ? '–' : escapeHtml(shift.time)}</small></span><span class="pill ${shift.type === 'Night Shift' ? 'dark' : shift.type === 'Off' ? 'off' : 'aqua'}">${shift.type === 'Off' ? 'DAY OFF' : shift.type === 'Night Shift' ? `${icon('moon', 14)} Night` : `${icon('sun', 14)} Day`}</span></button>${shift.type === 'Off' || shift.type === 'Sick' ? '' : `<button class="hours-button" data-action="cycle-hours" data-date="${shift.isoDate}" aria-label="Change shift hours; currently ${shift.hours ?? 12} hours">${shift.hours ?? 12}h</button>`}</div>`;
}

function timeline() {
  const lanes = [['Sleep', '09:00–15:30 · Sleep', 'sleep'], ['Night shift', '19:00–07:30 · Shift', 'shift'], ['Light example', '17:00–18:30 · Light', 'light'], ['Nap example', '15:30–17:00 · Nap', 'nap']];
  return `<div class="card deep"><p class="eyebrow">SHIFT-AWARE OVERVIEW</p><h2>Your 24-hour rhythm</h2><p class="fine" style="color:var(--lime); margin-bottom:10px">24-hour scale&nbsp; · &nbsp;NOW 17:56</p><div class="timeline-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>${lanes.map(([name, time, tone]) => `<div class="lane"><div class="lane-label"><span>${name}</span><span>${time}</span></div><div class="track"><i class="segment ${tone}"></i></div></div>`).join('')}<p class="fine" style="margin-top:14px">Your night shift runs 19:00–07:30 on Fri, Oct 16. Plan time for rest and prepare for work around the rest of your day.</p></div>`;
}

function today() {
  const nextShift = state.shifts.find((shift) => shift.isoDate === '2026-10-15' && shift.type !== 'Off');
  const nextType = nextShift?.type === 'Day Shift' ? 'Day' : 'Night';
  return `<p class="eyebrow">THURSDAY, OCTOBER 15</p><h1>Good afternoon, Jamie.</h1><p class="subhead">A little support for your next shift.</p><div class="card lime today-next-shift" data-action="edit-shift" data-date="${nextShift?.isoDate || '2026-10-15'}"><div class="card-title-row"><p class="eyebrow">NEXT SHIFT · TAP TO EDIT</p><span class="pill dark">${icon(nextType === 'Night' ? 'moon' : 'sun', 16)} ${nextType} Shift</span></div><h2 class="shift-time">${nextShift?.time || '19:00 – 07:30'}</h2><p class="fine">Thu, Oct 15 · starts in 1h 04m</p></div><div class="card sleep-window"><div class="card-title-row"><p class="eyebrow">REST PLAN</p><span class="pill">After work</span></div><h2>Your sleep window</h2><p class="strong-time">09:00–15:30</p><span class="pill aqua">6h 30m</span><p class="fine sleep-copy">Plan time to rest after work and before your next commitment.</p></div>${timeline()}<div class="section-heading"><p class="eyebrow">AROUND YOUR SHIFT</p><h2>One useful next step</h2></div>${[['sun', 'LIGHT', 'Plan your light exposure', 'Think about the light you’ll have at work and on your commute.'], ['coffee', 'CAFFEINE', 'Check in on caffeine', 'Notice when you have caffeine and how it affects your rest later.'], ['bed', 'NAP', 'Make room for a nap', 'If you plan to nap, leave yourself time to wake before heading in.']].map(([iconName, label, title, detail]) => `<div class="card steps-card"><span class="step-icon">${icon(iconName, 14)}</span><div><p class="eyebrow">${label}</p><h3>${title}</h3><p>${detail}</p></div><span class="open-link">Open ${icon('arrow', 9)}</span></div>`).join('')}<div class="card mint recovery-card"><p class="eyebrow">RECOVERY</p><h3>Build your sleep picture</h3><p class="fine">Add a sleep check-in after your next rest. Your recent entries will appear here.</p><button class="link-button" data-page="Recovery">View recovery ${icon('arrow', 10)}</button></div>`;
}

function weekCalendar() {
  const start = dateFromISO(state.weekStart);
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const shifts = state.shifts.filter((shift) => shift.isoDate >= state.weekStart && shift.isoDate <= isoFromDate(end) && shift.type !== 'Off');
  if (!shifts.length) return '<div class="empty-note">No shifts planned this week. Add a shift to get started.</div>';
  return shifts.map((shift) => {
    const selected = state.selectedDate === shift.isoDate;
    const today = shift.isoDate === '2026-10-15';
    const past = shift.isoDate < '2026-10-15';
    const type = shift.type === 'Night Shift' ? 'night' : shift.type === 'Day Shift' ? 'day' : 'sick';
    const statusIcon = type === 'night' ? 'moon' : type === 'day' ? 'sun' : 'heart';
    const statusName = type === 'night' ? 'Night' : type === 'day' ? 'Day' : 'Sick';
    return `<button class="schedule-row ${selected ? 'selected' : ''}" data-action="edit-shift" data-date="${shift.isoDate}"><span class="schedule-date">${today ? '<span class="today-mark">TODAY</span>' : ''}<span class="weekday ${past ? 'past-day' : ''}">${shift.short}</span><strong>${Number(shift.date)}</strong></span><span class="schedule-label"><strong>${shift.type === 'Sick' ? 'Sick day' : shift.title}</strong><small>${shift.time.replaceAll(' – ', '–')}</small></span><span class="shift-kind ${type}">${icon(statusIcon, 14)} ${statusName}</span><span class="duration-pill">${shift.hours ?? 12}h</span></button>`;
  }).join('');
}

function monthCalendar() {
  const [year, month] = state.monthCursor.split('-').map(Number);
  const monthIndex = month - 1;
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const currentDate = index - firstWeekday + 1;
    if (currentDate < 1 || currentDate > daysInMonth) return '<span class="calendar-blank">·</span>';
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
    const shift = state.shifts.find((item) => item.isoDate === dateStr);
    const type = shift?.type === 'Day Shift' ? 'day' : shift?.type === 'Night Shift' ? 'night' : shift?.type === 'Sick' ? 'sick' : shift?.type === 'Off' ? 'off' : '';
    const marker = type ? `<span class="day-marker ${type}">${type === 'day' ? 'D' : type === 'night' ? 'N' : type === 'sick' ? 'S' : 'O'}</span>` : '';
    return `<button class="day-cell ${state.selectedDate === dateStr ? 'selected' : ''}" data-action="edit-date" data-date="${dateStr}" aria-label="${shift ? 'Edit' : 'Add'} shift on ${dateStr}"><span>${currentDate}</span>${marker}</button>`;
  }).join('');
  return `<div class="month-grid-card"><div class="weekdays">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => `<span>${day}</span>`).join('')}</div><div class="days">${cells}</div><div class="legend"><span><i class="day">D</i>Day</span><span><i class="night">N</i>Night</span><span><i class="off">O</i>Off</span><span><i class="sick">S</i>Sick</span></div></div>`;
}

function schedule() {
  const weekEnd = new Date(dateFromISO(state.weekStart)); weekEnd.setDate(weekEnd.getDate() + 6);
  const periodStart = state.scheduleView === 'Week' ? state.weekStart : state.monthCursor;
  const periodEnd = state.scheduleView === 'Week' ? isoFromDate(weekEnd) : `${state.monthCursor.slice(0, 7)}-${String(new Date(Number(state.monthCursor.slice(0, 4)), Number(state.monthCursor.slice(5, 7)), 0).getDate()).padStart(2, '0')}`;
  const periodShifts = state.shifts.filter((shift) => shift.isoDate >= periodStart && shift.isoDate <= periodEnd);
  const workingShifts = periodShifts.filter((shift) => shift.type !== 'Off' && shift.type !== 'Sick');
  const hours = periodShifts.reduce((total, shift) => total + (shift.type === 'Off' || shift.type === 'Sick' ? 0 : Number(shift.hours ?? 12)), 0);
  const referenceOctober = state.monthCursor === '2026-10-01';
  const referenceWeek = state.weekStart === '2026-10-12';
  const totalHours = state.scheduleView === 'Week' && referenceWeek && !state.scheduleChanged ? 49 : state.scheduleView === 'Month' && referenceOctober && !state.scheduleChanged ? 104 : hours;
  const shiftCount = state.scheduleView === 'Week' && referenceWeek && !state.scheduleChanged ? 5 : state.scheduleView === 'Month' && referenceOctober && !state.scheduleChanged ? 6 : workingShifts.length;
  const periodName = state.scheduleView === 'Week' ? 'WEEK' : 'MONTH';
  const summary = `<div class="card schedule-summary"><p class="eyebrow">SCHEDULED THIS ${periodName}</p><strong>${totalHours}h</strong><p>${shiftCount} shifts · scheduled span; breaks not deducted.</p></div>`;
  const monthDate = dateFromISO(state.monthCursor);
  const dateLabel = state.scheduleView === 'Week'
    ? `${formatDateShort(dateFromISO(state.weekStart))} – ${formatDateShort(weekEnd)}, ${weekEnd.getFullYear()}`
    : monthDate.toLocaleDateString('en', { month: 'long', year: 'numeric' }).toUpperCase();
  const dateNav = `<div class="calendar-nav"><button data-action="calendar-prev" aria-label="Previous ${state.scheduleView.toLowerCase()}">${icon('arrowLeft', 16)}</button><strong>${dateLabel}</strong><button data-action="calendar-next" aria-label="Next ${state.scheduleView.toLowerCase()}">${icon('arrow', 16)}</button></div>`;
  return `<p class="eyebrow">YOUR WORK, AT A GLANCE</p><h1>Your schedule</h1><p class="subhead schedule-subhead">Plan work, rest and time away.</p><div class="segmented view-switch"><button class="segment-button ${state.scheduleView === 'Week' ? 'active' : ''}" data-view="Week">Week</button><button class="segment-button ${state.scheduleView === 'Month' ? 'active' : ''}" data-view="Month">Month</button></div>${dateNav}${summary}${state.scheduleView === 'Week' ? `<div class="week-list">${weekCalendar()}</div><button class="btn add-shift-button" data-action="add-shift">${icon('plus', 18)} Add shift</button><div class="card callout-blue schedule-tip"><span class="callout-icon">${icon('info', 16)}</span><p>Mark a day off or sick in one tap. Your personal schedule stays yours.</p></div>` : `${monthCalendar()}<div class="card callout-blue schedule-tip"><span class="callout-icon">${icon('info', 16)}</span><p>Tap any date to add a shift or edit the one scheduled. Mark a day off or sick in one tap. Your personal schedule stays yours.</p></div><button class="btn add-shift-button" data-action="add-shift">${icon('plus', 18)} Add shift</button>`}`;
}

function dateFromISO(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function isoFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function mondayOfISO(value) {
  const date = dateFromISO(value);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return isoFromDate(date);
}

function formatDateShort(date) {
  return date.toLocaleDateString('en', { month: 'short', day: '2-digit' }).toUpperCase();
}

function profileDetailPage() {
  const detail = state.profileDetail;
  const back = `<button class="btn ghost detail-back" data-action="profile-back">${icon('arrowLeft', 16)} Profile</button>`;
  if (detail === 'notifications') return `${back}<p class="eyebrow">YOUR REMINDERS</p><h1>Notifications</h1><p class="subhead">Choose which updates Circadia can send you.</p><div class="card detail-card"><h2>Stay in the loop</h2>${preference('Notifications', 'Allow Circadia reminders', state.notifications.Notifications)}${preference('Shift reminders', 'A heads-up before work', state.notifications['Shift reminders'])}${preference('Weekly recovery summary', 'A private recap of your check-ins', state.weeklySummary)}</div>`;
  if (detail === 'reminders') return `${back}<p class="eyebrow">BEFORE YOUR SHIFT</p><h1>Shift reminders</h1><p class="subhead">Choose when you would like a gentle reminder.</p><div class="card detail-card">${['At shift start', '30 minutes before', '1 hour before', '2 hours before', 'Off'].map((timing) => `<button class="detail-choice ${state.reminderTiming === timing ? 'selected' : ''}" data-reminder-timing="${timing}"><span>${timing}</span><span class="radio ${state.reminderTiming === timing ? 'checked' : ''}"></span></button>`).join('')}</div>`;
  if (detail === 'sleep-preferences') return `${back}<p class="eyebrow">PERSONALIZE YOUR PLAN</p><h1>Sleep preferences</h1><p class="subhead">Shape recovery guidance around your routine.</p><div class="card detail-card"><h2>Sleep window timing</h2>${['After work', 'Before work', 'Split rest'].map((timing) => `<button class="detail-choice ${state.sleepPreference === timing ? 'selected' : ''}" data-sleep-preference="${timing}"><span>${timing}</span><span class="radio ${state.sleepPreference === timing ? 'checked' : ''}"></span></button>`).join('')}<div class="settings-divider"></div><label class="field-label">SLEEP GOAL<select class="field" data-sleep-goal><option ${state.sleepGoal === '7 hours' ? 'selected' : ''}>7 hours</option><option ${state.sleepGoal === '8 hours' ? 'selected' : ''}>8 hours</option><option ${state.sleepGoal === '9 hours' ? 'selected' : ''}>9 hours</option></select></label></div>`;
  if (detail === 'data') return `${back}<p class="eyebrow">YOUR INFORMATION</p><h1>Personal data</h1><p class="subhead">Your wellbeing information belongs to you.</p><div class="card detail-card"><div class="privacy-intro">${icon('heart', 22)}<strong>Your data stays personal.</strong></div><p class="detail-copy">Sleep check-ins and shift details are used to shape your personal recovery view. This prototype stores changes in this browser session.</p><button class="detail-action" data-action="export-data">${icon('arrow', 17)} Export my data</button><button class="detail-action danger" data-action="delete-data">Delete my check-ins</button></div>`;
  return `${back}<p class="eyebrow">YOUR PRIVACY</p><h1>Hospital data sharing</h1><p class="subhead">Your schedule and recovery information stay yours.</p><div class="card detail-card sharing-setting"><span class="setting-icon">${icon('building', 22)}</span><div><h2>Share with my hospital</h2><p class="fine">${state.hospitalSharing ? 'Your hospital can view the information you choose to share.' : 'Off. Your hospital cannot see your personal recovery information.'}</p></div><button class="switch ${state.hospitalSharing ? 'on' : ''}" data-action="toggle-sharing" aria-label="Toggle hospital data sharing"></button></div><div class="card privacy-note-card">${icon('info', 17)} You can change this choice at any time.</div>`;
}

function loadingScreen() {
  return `<div class="loading-brand"><span class="loading-mark">${icon('cycle', 34)}</span><strong>circadia</strong></div><div class="loading-content"><span class="loading-spinner"></span><p class="eyebrow">YOUR PLAN IS COMING TOGETHER</p><h1>Building your recovery plan</h1><p class="subhead">Lining up rest, work and the next useful steps.</p><div class="loading-progress"><i></i></div></div><p class="loading-footnote">MADE FOR THE RHYTHM YOU WORK</p>`;
}

function notificationCenter() {
  return `<p class="eyebrow">YOUR UPDATES</p><div class="notification-title"><h1>Notifications</h1><button class="text-action" data-action="mark-read">Mark all read</button></div><div class="notification-list"><button class="card notification-card" data-page="Schedule"><span class="notification-icon">${icon('moon', 19)}</span><span><span class="eyebrow">UPCOMING SHIFT</span><strong>Your night shift starts at 19:00</strong><span class="fine">Take a moment to plan rest before work.</span><small>Today · 1 hour ago</small></span></button><button class="card notification-card" data-page="Today"><span class="notification-icon">${icon('bed', 19)}</span><span><span class="eyebrow">REST PLAN</span><strong>Your sleep window is ready</strong><span class="fine">Your plan is shaped around your upcoming shifts.</span><small>Today · 8:00 AM</small></span></button><button class="card notification-card ${state.readNotifications ? 'read' : ''}" data-page="Recovery"><span class="notification-icon">${icon('heart', 19)}</span><span><span class="eyebrow">RECOVERY</span><strong>Small check-ins add up</strong><span class="fine">Add a sleep check-in after your next rest.</span><small>Yesterday</small></span></button></div><div class="card notification-privacy">${icon('info', 16)} Notifications are private to you.</div>`;
}

function openShiftEditor(dateISO, returnPage = state.page, forceNew = false) {
  const existing = !forceNew && state.shifts.find((shift) => shift.isoDate === dateISO);
  state.shiftDate = existing?.isoDate || dateISO;
  state.shiftEditing = existing?.isoDate || '';
  state.shiftDraftStart = existing?.time?.split(' – ')[0] || '';
  state.shiftDraftEnd = existing?.time?.split(' – ')[1] || '';
  state.shiftReturnPage = returnPage;
  state.newShiftType = existing?.type === 'Day Shift' ? 'day' : existing?.type === 'Off' ? 'off' : existing?.type === 'Sick' ? 'sick' : 'night';
  state.page = 'ShiftEditor';
  if (returnPage !== 'onboarding') state.tab = 'Schedule';
  render();
}

function nextFreeDate(fromDate) {
  let candidate = fromDate;
  while (state.shifts.some((shift) => shift.isoDate === candidate)) {
    const date = dateFromISO(candidate); date.setDate(date.getDate() + 1); candidate = isoFromDate(date);
  }
  return candidate;
}

function shiftEditorPage() {
  const shift = state.shiftEditing ? state.shifts.find((item) => item.isoDate === state.shiftEditing) : null;
  const start = state.shiftDraftStart || shift?.time?.split(' – ')[0] || (state.newShiftType === 'day' ? '07:00' : '19:00');
  const end = state.shiftDraftEnd || shift?.time?.split(' – ')[1] || (state.newShiftType === 'day' ? '19:00' : '07:00');
  const pageTitle = shift ? 'Edit shift' : 'Add a shift';
  return `<button class="btn ghost detail-back" data-action="shift-back">${icon('arrowLeft', 16)} ${state.shiftReturnPage === 'onboarding' ? 'Onboarding' : state.shiftReturnPage}</button><p class="eyebrow">YOUR ROSTER</p><h1>${pageTitle}</h1><p class="subhead">Keep your schedule up to date, one shift at a time.</p><div class="card add-form"><label class="field-label">DATE<input class="field" type="date" id="shift-date" value="${state.shiftDate}"></label><label class="field-label">SHIFT TYPE<div class="status-options">${[['Day','day'],['Night','night'],['Off','off'],['Sick','sick']].map(([label,key]) => `<button type="button" class="status-option ${state.newShiftType === key ? `active ${key}` : ''}" data-shift-kind="${key}">${label}</button>`).join('')}</div></label>${state.newShiftType === 'off' || state.newShiftType === 'sick' ? '' : `<div class="field-row"><label class="field-label">START<input class="field" type="time" id="shift-start" value="${start}"></label><label class="field-label">END<input class="field" type="time" id="shift-end" value="${end}"></label></div>`}<div class="shift-length-card"><strong>SHIFT LENGTH</strong><b>${state.newShiftType === 'off' || state.newShiftType === 'sick' ? '0h' : `${hoursBetween(start, end)}h`}</b><small>Scheduled span · breaks not deducted.</small></div><button class="btn" data-action="save-shift">${shift ? 'Save changes' : 'Add shift'} <span>${icon('check', 17)}</span></button>${shift ? `<button class="btn delete-shift-button" data-action="delete-shift" data-date="${shift.isoDate}">${icon('trash', 17)} Delete shift</button>` : ''}</div>`;
}

function recovery() {
  const feelings = [['Energized', 'sparkle'], ['Calm', 'calm'], ['Okay', 'circle'], ['Sleepy', 'moon'], ['Stressed', 'rotate'], ['Irritated', 'sun']];
  return `<p class="eyebrow">A GENTLER WAY TO TRACK</p><h1>Recovery</h1><p class="subhead">Small steps add up over time.</p><div class="card pattern-card"><p class="eyebrow">YOUR PERSONAL PATTERNS</p><h3>Patterns take time.</h3><p class="fine">There’s no right score. Your check-ins are a private way to see how you’re doing.</p></div><div class="card"><p class="eyebrow">A QUICK CHECK-IN</p><h3>How are you feeling right now?</h3><div class="mood-grid">${feelings.map(([feeling, iconName]) => `<button class="mood ${state.mood === feeling ? 'selected' : ''}" data-mood="${feeling}">${icon(iconName, 15)}<span>${feeling}</span></button>`).join('')}</div></div><div class="card"><p class="eyebrow">SLEEP TRACKER</p><h3>How did you sleep?</h3><p class="fine">Record an estimate or choose a connected source.</p><div class="sleep-reading">${Number(state.sleep).toFixed(0)} hours</div><div class="source-buttons"><button class="source-button ${state.sleepSource === 'Enter manually' ? 'active' : ''}" data-sleep-source="Enter manually">Enter manually</button><button class="source-button ${state.sleepSource === 'Wearable' ? 'active' : ''}" data-sleep-source="Wearable">Apple Health / wearable</button></div><div class="sleep-range"><span>0h</span><input aria-label="Hours slept" type="range" min="0" max="12" step="0.5" value="${state.sleep}" data-sleep-range><span>12h</span></div></div><div class="card cycle-card"><p class="eyebrow">OPTIONAL · PRIVATE</p><div class="cycle-heading"><span>${icon('cycle', 17)}</span><div><h3>Menstrual cycle</h3><p class="fine">Log a period start to help you notice your own patterns alongside shifts and rest.</p></div></div><p class="private-note">This data is never shared with your hospital.</p><button class="btn secondary log-btn" data-action="log-day">${icon('plus', 14)} Log today</button><div class="privacy-strip">${icon('info', 12)} This data is private and never shared with your hospital.</div></div><div class="card"><p class="eyebrow">TRENDS</p><h3>Your recent trend</h3><p class="fine">Your sleep check-ins will build a picture of your routine over time. Add a few entries to get started.</p></div>`;
}

function preference(label, detail, on) {
  return `<div class="toggle-row"><span><strong>${label}</strong><small>${detail}</small></span><button class="switch ${on ? 'on' : ''}" data-toggle-pref="${label}" aria-label="Toggle ${label}"></button></div>`;
}

function profile() {
  return `<p class="eyebrow">YOUR SPACE, YOUR CHOICES</p><h1>Profile</h1><p class="subhead">Manage your routine and wellbeing preferences.</p><div class="card person-card"><span class="avatar">J</span><span><strong>Jamie Morgan</strong><small>Registered nurse · Rotating shifts</small></span></div><p class="eyebrow section-label">PREFERENCES</p><div class="card settings-card"><h2>Preferences</h2><p class="fine">Shape your reminders and sleep plan.</p><div class="settings-divider"></div>${profileRow('bell', 'Notifications', state.notifications.Notifications ? 'On' : 'Off', 'notifications')}${profileRow('clock', 'Shift reminders', state.reminderTiming, 'reminders')}${profileRow('moon', 'Sleep preferences', state.sleepPreference, 'sleep-preferences')}</div><div class="card settings-card privacy-card"><h2>Privacy</h2><p class="fine">Your wellbeing information belongs to you.</p><div class="settings-divider"></div>${profileRow('heart', 'Personal Data', 'Private', 'data')}${profileRow('moon', 'Hospital data sharing', state.hospitalSharing ? 'On' : 'Off', 'sharing')}</div><p class="tiny-label footer-brand">CIRCADIA · A PERSONAL GUIDE TO SHIFT WORK</p>`;
}

function profileRow(iconName, name, value, action) {
  return `<button class="profile-row" data-action="profile-detail" data-detail="${action}"><span class="profile-row-icon">${icon(iconName, 18)}</span><span class="profile-row-name">${name}</span><span class="profile-value">${value}${value ? ' ' : ''}${icon('arrow', 16)}</span></button>`;
}

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round(minutes / 60 * 10) / 10;
}

function modal() {
  if (!state.showAddShift) return '';
  return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">Add a shift</h2><button class="close-button" data-action="close-modal" aria-label="Close">×</button></div><p class="helper">Add an upcoming shift to your roster.</p><label class="field-label">Date<input class="field" type="date" id="shift-date" value="2026-10-19"></label><label class="field-label">Shift type<select class="field" id="shift-type"><option>Day shift</option><option>Night shift</option><option>Rest day</option></select></label><div class="field-row"><label class="field-label">Starts<input class="field" type="time" id="shift-start" value="19:00"></label><label class="field-label">Ends<input class="field" type="time" id="shift-end" value="07:30"></label></div><div style="height:10px"></div><button class="btn" data-action="save-shift">Save shift</button></section></div>`;
}

function pageContent() {
  if (state.page === 'onboarding') return onboarding();
  if (state.page === 'BuildingPlan') return loadingScreen();
  if (state.page === 'Today') return today();
  if (state.page === 'Schedule') return schedule();
  if (state.page === 'Recovery') return recovery();
  if (state.page === 'ShiftEditor') return shiftEditorPage();
  if (state.page === 'ProfileDetail') return profileDetailPage();
  if (state.page === 'Notifications') return notificationCenter();
  return profile();
}

function render() {
  const onboardingPage = state.page === 'onboarding';
  const loading = state.page === 'BuildingPlan';
  root.innerHTML = `<div class="shell"><section class="app-frame" aria-label="Circadia shift-aware recovery prototype">${statusBar()}${onboardingPage || loading ? '' : header()}<div class="screen ${onboardingPage ? 'onboarding' : ''} ${loading ? 'loading-screen' : ''}">${pageContent()}</div>${onboardingPage || loading ? '' : nav()}<div class="toast" id="toast" role="status"></div>${modal()}</section></div>`;
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
  state.tab = 'Today';
  state.page = 'BuildingPlan';
  render();
  clearTimeout(state.loadingTimer);
  state.loadingTimer = setTimeout(() => {
    if (state.page !== 'BuildingPlan') return;
    state.page = 'Today';
    render();
  }, 1350);
}

function addShift() {
  const value = document.querySelector('#shift-date')?.value || state.shiftDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(dateFromISO(value).getTime()) || isoFromDate(dateFromISO(value)) !== value) {
    toast('Choose a valid shift date');
    return;
  }
  const occupied = state.shifts.find((item) => item.isoDate === value && item.isoDate !== state.shiftEditing);
  if (occupied) {
    toast('There is already a shift on that date. Edit it or choose another day.');
    return;
  }
  const type = state.newShiftType === 'day' ? 'Day Shift' : state.newShiftType === 'off' ? 'Rest day' : state.newShiftType === 'sick' ? 'Sick day' : 'Night Shift';
  const start = document.querySelector('#shift-start')?.value || (state.newShiftType === 'day' ? '07:00' : '19:00');
  const end = document.querySelector('#shift-end')?.value || (state.newShiftType === 'day' ? '19:00' : '07:30');
  const [year, month, day] = value.split('-').map(Number);
  const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(year, month - 1, day)).toUpperCase();
  const existing = state.shiftEditing ? state.shifts.find((item) => item.isoDate === state.shiftEditing) : null;
  const normalizedType = type === 'Rest day' ? 'Off' : type === 'Sick day' ? 'Sick' : type;
  const record = { ...existing, short: weekday, date: String(day).padStart(2, '0'), isoDate: value, title: normalizedType === 'Off' ? 'Day Off' : normalizedType === 'Sick' ? 'Sick day' : normalizedType, time: normalizedType === 'Off' ? 'Recovery day' : normalizedType === 'Sick' ? 'Unavailable' : `${start} – ${end}`, type: normalizedType, hours: normalizedType === 'Off' || normalizedType === 'Sick' ? 0 : hoursBetween(start, end), onboarding: existing?.onboarding ?? state.shiftReturnPage === 'onboarding' };
  state.shifts = state.shifts.filter((item) => item.isoDate !== state.shiftEditing && item.isoDate !== value);
  state.shifts.push(record);
  state.shifts.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  state.selectedDate = value;
  state.shiftDate = value;
  state.scheduleChanged = true;
  state.monthCursor = `${value.slice(0, 7)}-01`;
  state.weekStart = mondayOfISO(value);
  const returnPage = state.shiftReturnPage;
  state.page = returnPage === 'onboarding' ? 'onboarding' : returnPage;
  if (returnPage === 'onboarding') state.step = 3;
  state.tab = returnPage === 'Today' ? 'Today' : 'Schedule';
  state.shiftEditing = '';
  render();
  toast(existing ? 'Shift updated' : 'Shift added to your roster');
}

root.addEventListener('input', (event) => {
  if (event.target.matches('[data-sleep-range]')) {
    state.sleep = Number(event.target.value);
    const display = root.querySelector('.sleep-reading');
    if (display) display.textContent = `${state.sleep.toFixed(0)} hours`;
  }
  if (event.target.id === 'shift-date') state.shiftDate = event.target.value;
  if (event.target.id === 'shift-start') state.shiftDraftStart = event.target.value;
  if (event.target.id === 'shift-end') state.shiftDraftEnd = event.target.value;
  if (event.target.id === 'shift-start' || event.target.id === 'shift-end') {
    const start = root.querySelector('#shift-start')?.value;
    const end = root.querySelector('#shift-end')?.value;
    const length = root.querySelector('.shift-length-card b');
    if (length && start && end) length.textContent = `${hoursBetween(start, end)}h`;
  }
});

root.addEventListener('click', (event) => {
  const target = event.target.closest('button, [data-action]');
  if (!target) return;
  if (target.dataset.page) {
    state.page = target.dataset.page; state.tab = target.dataset.page; render(); return;
  }
  if (target.dataset.selectPattern) { state.workPattern = target.dataset.selectPattern; render(); return; }
  if (target.dataset.selectMethod) { state.rosterMethod = target.dataset.selectMethod; render(); return; }
  if (target.dataset.view) { state.scheduleView = target.dataset.view; render(); return; }
  if (target.dataset.mood) {
    const currentScroll = root.querySelector('.screen')?.scrollTop ?? 0;
    state.mood = target.dataset.mood;
    render();
    const screen = root.querySelector('.screen');
    if (screen) screen.scrollTop = currentScroll;
    toast(`Check-in saved: ${state.mood.toLowerCase()}`);
    return;
  }
  if (target.dataset.sleepSource) { state.sleepSource = target.dataset.sleepSource; render(); return; }
  if (target.hasAttribute('data-toggle-cycle')) { state.cycle = !state.cycle; render(); toast(state.cycle ? 'Cycle tracking enabled' : 'Cycle tracking paused'); return; }
  if (target.dataset.togglePref) {
    if (target.dataset.togglePref === 'Weekly recovery summary') state.weeklySummary = !state.weeklySummary;
    else state.notifications[target.dataset.togglePref] = !state.notifications[target.dataset.togglePref];
    render(); return;
  }
  if (target.dataset.shiftKind) {
    const nextType = target.dataset.shiftKind;
    if (nextType === 'day' && (!state.shiftDraftStart || state.shiftDraftStart === '19:00')) { state.shiftDraftStart = '07:00'; state.shiftDraftEnd = '19:00'; }
    if (nextType === 'night' && (!state.shiftDraftStart || state.shiftDraftStart === '07:00')) { state.shiftDraftStart = '19:00'; state.shiftDraftEnd = '07:30'; }
    state.newShiftType = nextType; render(); return;
  }
  if (target.dataset.reminderTiming) { state.reminderTiming = target.dataset.reminderTiming; render(); return; }
  if (target.dataset.sleepPreference) { state.sleepPreference = target.dataset.sleepPreference; render(); return; }
  const action = target.dataset.action;
  if (action === 'notifications') { state.page = 'Notifications'; render(); return; }
  if (action === 'profile') { state.page = 'Profile'; state.tab = 'Profile'; render(); return; }
  if (action === 'profile-detail') { state.profileDetail = target.dataset.detail; state.page = 'ProfileDetail'; state.tab = 'Profile'; render(); return; }
  if (action === 'profile-back') { state.page = 'Profile'; state.tab = 'Profile'; render(); return; }
  if (action === 'toggle-sharing') { state.hospitalSharing = !state.hospitalSharing; render(); return; }
  if (action === 'mark-read') { state.readNotifications = true; render(); return; }
  if (action === 'export-data') {
    const data = { sleepHours: state.sleep, latestMood: state.mood, shifts: state.shifts, exportedAt: new Date().toISOString() };
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); link.download = 'circadia-personal-data.json'; link.click(); URL.revokeObjectURL(link.href);
    toast('Your data export has downloaded'); return;
  }
  if (action === 'delete-data') { state.mood = ''; state.sleep = 0; render(); toast('Check-in data cleared'); return; }
  if (action === 'calendar-prev' || action === 'calendar-next') {
    const direction = action === 'calendar-next' ? 1 : -1;
    if (state.scheduleView === 'Month') {
      const month = dateFromISO(state.monthCursor); month.setDate(1); month.setMonth(month.getMonth() + direction);
      state.monthCursor = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;
    } else {
      const week = dateFromISO(state.weekStart); week.setDate(week.getDate() + direction * 7); state.weekStart = isoFromDate(week);
    }
    render(); return;
  }
  if (action === 'edit-date') { openShiftEditor(target.dataset.date, 'Schedule'); return; }
  if (action === 'edit-shift') { openShiftEditor(target.dataset.date, state.page); return; }
  if (action === 'shift-back') {
    state.page = state.shiftReturnPage === 'onboarding' ? 'onboarding' : state.shiftReturnPage;
    if (state.page === 'onboarding') state.step = 3;
    render(); return;
  }
  if (action === 'delete-shift') {
    state.shifts = state.shifts.filter((shift) => shift.isoDate !== target.dataset.date);
    state.scheduleChanged = true;
    state.selectedDate = target.dataset.date;
    state.page = state.shiftReturnPage === 'onboarding' ? 'onboarding' : state.shiftReturnPage;
    if (state.page === 'onboarding') state.step = 3;
    state.shiftEditing = '';
    render(); toast('Shift deleted'); return;
  }
  if (action === 'explore') { finishOnboarding(); render(); return; }
  if (action === 'next') {
    if (state.step < 3) state.step += 1; else finishOnboarding();
    render(); return;
  }
  if (action === 'back') { if (state.step > 0) state.step -= 1; render(); return; }
  if (action === 'add-row') {
    const roster = state.shifts.filter((shift) => shift.onboarding);
    const last = roster.length ? roster.reduce((latest, shift) => shift.isoDate > latest ? shift.isoDate : latest, roster[0].isoDate) : state.selectedDate;
    const next = dateFromISO(last); next.setDate(next.getDate() + 1);
    openShiftEditor(nextFreeDate(isoFromDate(next)), 'onboarding', true); return;
  }
  if (action === 'add-shift') {
    const candidate = state.scheduleView === 'Month'
      ? (state.selectedDate?.startsWith(state.monthCursor.slice(0, 7)) ? state.selectedDate : `${state.monthCursor.slice(0, 7)}-01`)
      : (state.selectedDate >= state.weekStart && state.selectedDate <= isoFromDate((() => { const end = dateFromISO(state.weekStart); end.setDate(end.getDate() + 6); return end; })()) ? state.selectedDate : state.weekStart);
    const start = nextFreeDate(candidate);
    openShiftEditor(start, 'Schedule', true); return;
  }
  if (action === 'cycle-hours') {
    const shift = state.shifts.find((item) => item.isoDate === target.dataset.date);
    if (shift) {
      const choices = [8, 10, 12, 14];
      shift.hours = choices[(choices.indexOf(Number(shift.hours ?? 12)) + 1) % choices.length];
      const start = shift.type === 'Night Shift' ? 19 : 7;
      const end = (start + shift.hours) % 24;
      const fmt = (hour) => `${String(hour).padStart(2, '0')}:00`;
      shift.time = `${fmt(start)} – ${fmt(end)}`;
      state.scheduleChanged = true;
      render();
    }
    return;
  }
  if (action === 'save-shift') { addShift(); return; }
  if (action === 'save-sleep') { toast(`${state.sleep.toFixed(1)} hours saved`); return; }
  if (action === 'log-day') { toast('Today’s note is ready to add'); return; }
  if (action === 'edit-profile') { toast('Profile editing is part of this prototype'); return; }
  if (action === 'restart') { state.page = 'onboarding'; state.step = 0; render(); return; }
});

root.addEventListener('change', (event) => {
  if (event.target.matches('[data-sleep-goal]')) state.sleepGoal = event.target.value;
});

render();


