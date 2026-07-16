import React, { useEffect, useRef, useState } from 'react';
import SettingsModal from './SettingsModal.jsx';
import CalendarModal from './CalendarModal.jsx';
import RolloverModal from './RolloverModal.jsx';
import Auth from './Auth.jsx';
import { supabase, supabaseConfigured } from './supabaseClient.js';
import { todayKey, parseDateKey, formatLabel } from './dateUtils.js';

const STAR_DEFS = [
  { t: 14, l: 12, s: 3, d: 0 }, { t: 28, l: 82, s: 2, d: .6 }, { t: 9, l: 54, s: 2, d: 1.2 }, { t: 44, l: 24, s: 3, d: .3 },
  { t: 38, l: 70, s: 2, d: .9 }, { t: 60, l: 88, s: 3, d: 1.5 }, { t: 56, l: 8, s: 2, d: .4 }, { t: 72, l: 40, s: 2, d: 1.1 },
  { t: 80, l: 66, s: 3, d: .7 }, { t: 66, l: 56, s: 2, d: 1.8 }, { t: 88, l: 20, s: 2, d: .2 }, { t: 22, l: 38, s: 2, d: 1.4 },
  { t: 50, l: 48, s: 2, d: 2.1 }, { t: 84, l: 90, s: 2, d: .5 },
];
const SPARKLE_DEFS = [
  { x: -16, y: -4 }, { x: 22, y: 0 }, { x: 6, y: -22 }, { x: 30, y: 22 }, { x: -18, y: 20 }, { x: 10, y: 28 },
];

const CATS = { Work: '#6C8AE4', Personal: '#E8956B', Health: '#4FB98A', Errands: '#D99A3D', Ideas: '#B98CE0', Urgent: '#E4655A', General: '#A99E90' };
const PRIO = { high: '#E4655A', medium: '#D99A3D', low: '#7CB86A' };
const TIMER_PRESETS = [15, 25, 45, 60];

const CANNED = {
  empty: ["Ooh, blank slate! Dump your brain in there ✨", "Nothing yet? Tell me what's on your mind.", "I'm bored. Give me tasks to boss you around with."],
  meh: ["Zero done. No pressure. (some pressure.) 👀", "That list won't cross itself off, friend.", "We move! Pick literally any one.", "Bold of you to just... stare at it."],
  neutral: ["Nice, we're rolling. Keep going!", "Momentum tastes great, huh?", "Look at you being a functional adult.", "One down, the rest are shaking."],
  happy: ["You're on a roll 🔥 don't stop now!", "Halfway hero. I'm impressed.", "Ok ok, showing off a little 😌", "Certified productive human detected."],
  ecstatic: ["ALL DONE. I'm so proud 🥹", "You ATE this list up. Respect.", "Legend behavior. Go rest now!", "I'm basically glowing rn ✨"],
};

const THEMES = {
  cozy: { '--bg': '#F3E7D7', '--card': '#FFFCF7', '--text': '#5A4634', '--muted': '#A08B76', '--accent': '#E8956B', '--accent2': '#F5CFA8', '--line': '#EAD9C6', '--eink': '#5A4634', '--st': 'solid', '--rad': '22px', '--font': "'Quicksand',sans-serif", '--head': "'Fredoka',sans-serif", '--chip': '#FBF3EA', '--input': '#FBF3EA' },
  dark: { '--bg': '#191622', '--card': '#241F30', '--text': '#EDE7F7', '--muted': '#8A80A6', '--accent': '#B79CED', '--accent2': '#3C3452', '--line': '#352E48', '--eink': '#EDE7F7', '--st': 'solid', '--rad': '22px', '--font': "'Quicksand',sans-serif", '--head': "'Fredoka',sans-serif", '--chip': '#2E2840', '--input': '#2E2840' },
  sketch: { '--bg': '#F7F2E7', '--card': '#FFFFFF', '--text': '#2C2A26', '--muted': '#8B8577', '--accent': '#F0803C', '--accent2': '#FCE3C8', '--line': '#2C2A26', '--eink': '#2C2A26', '--st': 'dashed', '--rad': '14px', '--font': "'Patrick Hand',cursive", '--head': "'Patrick Hand',cursive", '--chip': '#FBF6EC', '--input': '#FBF6EC' },
};

const DEFAULT_TASKS = [
  { id: 's1', text: 'Water the real plants 🌿', category: 'Personal', priority: 'low', done: true },
  { id: 's2', text: 'Draft the launch email', category: 'Work', priority: 'high', done: false },
  { id: 's3', text: '15-min stretch break', category: 'Health', priority: 'medium', done: false },
];
const EMPTY_DAY = { tasks: [], notes: '', pomos: 0, resolved: false };

const hasBridge = typeof window !== 'undefined' && !!window.sprout;
const newId = () => Date.now() + '' + Math.random().toString(36).slice(2, 6);
const wordCount = (text) => (text || '').trim() ? text.trim().split(/\s+/).length : 0;

function face(mood) {
  const eink = '#5A4A2E';
  const dot = { width: '8px', height: '8px', borderRadius: '50%', background: eink };
  const arc = { width: '11px', height: '6px', borderTop: `3px solid ${eink}`, borderRadius: '11px 11px 0 0', background: 'transparent' };
  const sleepy = { width: '9px', height: '3px', borderRadius: '3px', background: eink };
  const smile = { width: '16px', height: '8px', borderBottom: `3px solid ${eink}`, borderRadius: '0 0 16px 16px', background: 'transparent' };
  const bigSmile = { width: '18px', height: '11px', background: eink, borderRadius: '0 0 40px 40px' };
  const line = { width: '11px', height: '3px', borderRadius: '3px', background: eink };
  const frown = { width: '12px', height: '6px', borderTop: `3px solid ${eink}`, borderRadius: '12px 12px 0 0', background: 'transparent' };
  const oh = { width: '8px', height: '8px', border: `2px solid ${eink}`, borderRadius: '50%', background: 'transparent' };
  if (mood === 'ecstatic') return { eye: arc, mouth: bigSmile, cheeks: true };
  if (mood === 'happy') return { eye: arc, mouth: smile, cheeks: true };
  if (mood === 'neutral') return { eye: dot, mouth: line, cheeks: false };
  if (mood === 'meh') return { eye: sleepy, mouth: frown, cheeks: false };
  return { eye: dot, mouth: oh, cheeks: false }; // idle
}

function localSort(text) {
  return text.split(/[\n,;]+/).map(x => x.trim()).filter(Boolean).map(x => ({ task: x, category: 'General', priority: 'medium' }));
}

const noDrag = { WebkitAppRegion: 'no-drag' };

export default function App() {
  const [state, setState] = useState({
    theme: 'cozy', tab: 'today',
    days: {}, todayDate: todayKey(), viewingDate: null,
    newTask: '',
    dumpOpen: false, dumpText: '', sorting: false,
    mascotMsg: '', talking: false,
    mode: 'focus', secondsLeft: 1500, running: false,
    focusMinutes: 25, breakMinutes: 5,
    celebrate: false,
    showSettings: false, apiKeyPresent: false, apiKeyDraft: '', settingsSaved: false,
    showCalendar: false, rolloverPending: null,
    authChecked: false, session: null,
  });
  const celebTimeout = useRef(null);
  const [calCursor, setCalCursor] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  const patch = (obj) => setState(s => ({ ...s, ...(typeof obj === 'function' ? obj(s) : obj) }));

  // ---- figure out today's rollover state against a loaded `days` map ----
  function withRollover(days) {
    const tKey = todayKey();
    const lastActive = localStorage.getItem('sprout_last_active_date') || tKey;
    let pending = null;
    if (lastActive !== tKey) {
      const prevEntry = days[lastActive];
      if (prevEntry && !prevEntry.resolved) {
        const unchecked = prevEntry.tasks.filter(t => !t.done);
        if (unchecked.length) pending = { date: lastActive, tasks: unchecked };
      }
    }
    if (!days[tKey]) days[tKey] = { ...EMPTY_DAY };
    try {
      localStorage.setItem('sprout_days', JSON.stringify(days));
      localStorage.setItem('sprout_last_active_date', tKey);
    } catch (e) {}
    return { days, tKey, pending };
  }

  function localPrefsPatch() {
    const th = localStorage.getItem('sprout_theme');
    const fm = localStorage.getItem('sprout_focus_minutes');
    const bm = localStorage.getItem('sprout_break_minutes');
    const p = {};
    if (th && THEMES[th]) p.theme = th;
    if (fm) p.focusMinutes = parseInt(fm) || 25;
    if (bm) p.breakMinutes = parseInt(bm) || 5;
    return p;
  }

  // ---- load this user's days from Supabase, importing any pre-existing local data once ----
  async function loadCloudDays(session) {
    let localDays = null;
    try {
      const raw = localStorage.getItem('sprout_days');
      if (raw) localDays = JSON.parse(raw);
    } catch (e) {}

    const { data, error } = await supabase.from('days').select('*').eq('user_id', session.user.id);
    if (error) { console.warn('Sprout: failed to load cloud days:', error.message); patch({ authChecked: true, session }); return; }

    let days = {};
    if (data && data.length) {
      data.forEach(row => { days[row.date] = { tasks: row.tasks || [], notes: row.notes || '', pomos: row.pomos || 0, resolved: !!row.resolved }; });
    } else if (localDays && Object.keys(localDays).length) {
      // first login on this device with an empty cloud account: bring over whatever was stored locally
      days = localDays;
      for (const [date, entry] of Object.entries(days)) {
        const { error: upErr } = await supabase.from('days').upsert({ user_id: session.user.id, date, tasks: entry.tasks, notes: entry.notes, pomos: entry.pomos, resolved: !!entry.resolved }, { onConflict: 'user_id,date' });
        if (upErr) console.warn('Sprout: failed to import local day', date, upErr.message);
      }
    }

    const { days: finalDays, tKey, pending } = withRollover(days);
    patch({ authChecked: true, session, days: finalDays, todayDate: tKey, rolloverPending: pending, ...localPrefsPatch() });
  }

  function loadLocalOnly() {
    let days = null;
    try {
      const rawDays = localStorage.getItem('sprout_days');
      if (rawDays) days = JSON.parse(rawDays);
    } catch (e) {}

    if (!days) {
      const legacyTasks = localStorage.getItem('sprout_tasks');
      const legacyNotes = localStorage.getItem('sprout_notes');
      const legacyPomos = localStorage.getItem('sprout_pomos');
      days = {};
      days[todayKey()] = {
        tasks: legacyTasks ? JSON.parse(legacyTasks) : DEFAULT_TASKS,
        notes: legacyNotes || '',
        pomos: legacyPomos ? (parseInt(legacyPomos) || 0) : 0,
        resolved: false,
      };
    }

    const { days: finalDays, tKey, pending } = withRollover(days);
    patch({ authChecked: true, days: finalDays, todayDate: tKey, rolloverPending: pending, ...localPrefsPatch() });
  }

  // ---- mount: resolve auth (if configured) or fall back to local-only, then detect day rollover ----
  useEffect(() => {
    if (hasBridge) window.sprout.getApiKeyPresent().then(present => patch({ apiKeyPresent: !!present }));

    if (!supabaseConfigured) { loadLocalOnly(); return; }

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) loadCloudDays(data.session);
      else patch({ authChecked: true, session: null });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) loadCloudDays(session);
      if (event === 'SIGNED_OUT') patch({ session: null, days: {}, viewingDate: null, tab: 'today', showSettings: false, showCalendar: false, rolloverPending: null, authChecked: true });
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  // ---- timer tick ----
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        if (!s.running) return s;
        if (s.secondsLeft <= 1) return finishSession(s);
        return { ...s, secondsLeft: s.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ---- day-rollover watch (in case the widget stays open across midnight) ----
  useEffect(() => {
    const id = setInterval(() => {
      const tKey = todayKey();
      setState(s => {
        if (s.todayDate === tKey) return s;
        const days = { ...s.days };
        const prevEntry = days[s.todayDate];
        let pending = s.rolloverPending;
        if (prevEntry && !prevEntry.resolved) {
          const unchecked = prevEntry.tasks.filter(t => !t.done);
          if (unchecked.length) pending = { date: s.todayDate, tasks: unchecked };
        }
        if (!days[tKey]) days[tKey] = { ...EMPTY_DAY };
        try {
          localStorage.setItem('sprout_days', JSON.stringify(days));
          localStorage.setItem('sprout_last_active_date', tKey);
        } catch (e) {}
        return { ...s, days, todayDate: tKey, viewingDate: null, rolloverPending: pending };
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  function finishSession(s) {
    const todayEntry = s.days[s.todayDate] || { ...EMPTY_DAY };
    if (s.mode === 'focus') {
      const days = { ...s.days, [s.todayDate]: { ...todayEntry, pomos: todayEntry.pomos + 1 } };
      save({ days }, s.todayDate);
      return { ...s, days, mode: 'break', secondsLeft: s.breakMinutes * 60, running: false, mascotMsg: 'Focus session done! Grab some tea 🍵' };
    }
    return { ...s, mode: 'focus', secondsLeft: s.focusMinutes * 60, running: false, mascotMsg: "Break's over — let's get back in it 💪" };
  }

  function pushDayToCloud(dateKey, entry) {
    if (!supabaseConfigured || !state.session || !entry) return;
    supabase.from('days')
      .upsert({ user_id: state.session.user.id, date: dateKey, tasks: entry.tasks, notes: entry.notes, pomos: entry.pomos, resolved: !!entry.resolved }, { onConflict: 'user_id,date' })
      .then(({ error }) => { if (error) console.warn('Sprout: cloud sync failed:', error.message); });
  }

  function save(next, changedDate) {
    try {
      if (next.days) localStorage.setItem('sprout_days', JSON.stringify(next.days));
      if (next.theme) localStorage.setItem('sprout_theme', next.theme);
      if (next.focusMinutes !== undefined) localStorage.setItem('sprout_focus_minutes', String(next.focusMinutes));
      if (next.breakMinutes !== undefined) localStorage.setItem('sprout_break_minutes', String(next.breakMinutes));
    } catch (e) {}
    if (changedDate && next.days) pushDayToCloud(changedDate, next.days[changedDate]);
  }

  const setTheme = (t) => { patch({ theme: t }); save({ theme: t }); };
  const setTab = (t) => patch({ tab: t });

  function addTask(text, category, priority) {
    const txt = (text || '').trim();
    if (!txt) return;
    const task = { id: newId(), text: txt, category: category || 'General', priority: priority || 'medium', done: false };
    setState(s => {
      const todayEntry = s.days[s.todayDate] || { ...EMPTY_DAY };
      const days = { ...s.days, [s.todayDate]: { ...todayEntry, tasks: [...todayEntry.tasks, task] } };
      save({ days }, s.todayDate);
      return { ...s, days, newTask: '', mascotMsg: '' };
    });
  }
  const addManual = () => addTask(state.newTask);
  const onNewTask = (e) => patch({ newTask: e.target.value });
  const onNewTaskKey = (e) => { if (e.key === 'Enter') addManual(); };

  function toggleTask(id) {
    setState(s => {
      const todayEntry = s.days[s.todayDate] || { ...EMPTY_DAY };
      const tasks = todayEntry.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      const days = { ...s.days, [s.todayDate]: { ...todayEntry, tasks } };
      save({ days }, s.todayDate);
      const total = tasks.length, done = tasks.filter(t => t.done).length;
      const wasAll = todayEntry.tasks.length > 0 && todayEntry.tasks.every(t => t.done);
      const next = { ...s, days, mascotMsg: '' };
      if (total > 0 && done === total && !wasAll) {
        const arr = CANNED.ecstatic;
        next.mascotMsg = arr[Math.floor(Math.random() * arr.length)];
        next.celebrate = true;
        clearTimeout(celebTimeout.current);
        celebTimeout.current = setTimeout(() => patch({ celebrate: false }), 2800);
      }
      return next;
    });
  }
  function removeTask(id) {
    setState(s => {
      const todayEntry = s.days[s.todayDate] || { ...EMPTY_DAY };
      const days = { ...s.days, [s.todayDate]: { ...todayEntry, tasks: todayEntry.tasks.filter(t => t.id !== id) } };
      save({ days }, s.todayDate);
      return { ...s, days };
    });
  }

  const toggleDump = () => patch(s => ({ dumpOpen: !s.dumpOpen }));
  const onDump = (e) => patch({ dumpText: e.target.value });

  async function aiSort() {
    const text = state.dumpText.trim();
    if (!text) return;
    patch({ sorting: true });
    let items = [];
    try {
      if (!hasBridge) throw new Error('no ai');
      const res = await window.sprout.sortBrainDump(text);
      if (!res.ok) throw new Error(res.reason || 'error');
      let raw = res.text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const a = raw.indexOf('['), b = raw.lastIndexOf(']');
      if (a >= 0 && b > a) raw = raw.slice(a, b + 1);
      items = JSON.parse(raw);
      if (!Array.isArray(items) || !items.length) throw new Error('bad');
    } catch (e) {
      items = localSort(text);
    }
    const valid = Object.keys(CATS);
    const newTasks = items.filter(i => i && i.task).map(i => ({
      id: newId(),
      text: String(i.task).slice(0, 80),
      category: valid.includes(i.category) ? i.category : 'General',
      priority: ['high', 'medium', 'low'].includes(i.priority) ? i.priority : 'medium',
      done: false,
    }));
    setState(s => {
      const todayEntry = s.days[s.todayDate] || { ...EMPTY_DAY };
      const days = { ...s.days, [s.todayDate]: { ...todayEntry, tasks: [...todayEntry.tasks, ...newTasks] } };
      save({ days }, s.todayDate);
      return { ...s, days, sorting: false, dumpText: '', dumpOpen: false, mascotMsg: `Sorted that into ${newTasks.length} task${newTasks.length === 1 ? '' : 's'} ✨` };
    });
  }

  async function talkToMascot() {
    const tasks = (state.days[state.todayDate] || EMPTY_DAY).tasks, done = tasks.filter(t => t.done).length, total = tasks.length;
    const bucket = total === 0 ? 'empty' : done === total ? 'ecstatic' : done / total >= 0.5 ? 'happy' : done > 0 ? 'neutral' : 'meh';
    patch({ talking: true });
    let line = '';
    try {
      if (!hasBridge) throw new Error('no ai');
      const res = await window.sprout.mascotLine(`I've completed ${done} of ${total} tasks today.`);
      if (!res.ok) throw new Error(res.reason || 'error');
      line = (res.text || '').trim().replace(/^["']|["']$/g, '');
      if (!line) throw new Error('empty');
    } catch (e) {
      const arr = CANNED[bucket];
      line = arr[Math.floor(Math.random() * arr.length)];
    }
    patch({ talking: false, mascotMsg: line });
  }

  const toggleTimer = () => patch(s => ({ running: !s.running }));
  const resetTimer = () => patch(s => ({ running: false, secondsLeft: s.mode === 'focus' ? s.focusMinutes * 60 : s.breakMinutes * 60 }));
  const setFocusMode = () => patch(s => ({ mode: 'focus', secondsLeft: s.focusMinutes * 60, running: false }));
  const setBreakMode = () => patch(s => ({ mode: 'break', secondsLeft: s.breakMinutes * 60, running: false }));

  function applyMinutes(mode, minutes) {
    const clamped = Math.max(1, Math.min(180, Math.round(minutes) || 0));
    if (!clamped) return;
    patch(s => {
      const fields = mode === 'focus' ? { focusMinutes: clamped } : { breakMinutes: clamped };
      save(fields);
      const isActiveMode = s.mode === mode;
      return { ...fields, secondsLeft: isActiveMode ? clamped * 60 : s.secondsLeft, running: isActiveMode ? false : s.running };
    });
    setCustomOpen(false); setCustomDraft('');
  }
  const applyPreset = (m) => applyMinutes(state.mode, m);
  const applyCustom = () => applyMinutes(state.mode, parseInt(customDraft, 10));

  const onNotes = (e) => {
    const notes = e.target.value;
    setState(s => {
      const todayEntry = s.days[s.todayDate] || { ...EMPTY_DAY };
      const days = { ...s.days, [s.todayDate]: { ...todayEntry, notes } };
      save({ days }, s.todayDate);
      return { ...s, days };
    });
  };

  // ---- calendar ----
  const backToToday = () => patch({ viewingDate: null });
  const onTodayTabClick = () => {
    if (state.tab !== 'today') { setTab('today'); return; }
    const opening = !state.showCalendar;
    if (opening) {
      const base = parseDateKey(state.viewingDate || state.todayDate);
      setCalCursor({ year: base.getFullYear(), month: base.getMonth() });
    }
    patch({ showCalendar: opening });
  };
  const prevMonth = () => setCalCursor(c => { let { year, month } = c; month--; if (month < 0) { month = 11; year--; } return { year, month }; });
  const nextMonth = () => setCalCursor(c => { let { year, month } = c; month++; if (month > 11) { month = 0; year++; } return { year, month }; });
  const selectDate = (key) => {
    if (key === state.todayDate) patch({ viewingDate: null, showCalendar: false });
    else patch({ viewingDate: key, showCalendar: false });
  };

  // ---- rollover popup ----
  function resolveRollover(selectedIds) {
    setState(s => {
      const days = { ...s.days };
      const from = { ...(days[s.rolloverPending.date] || { ...EMPTY_DAY }), resolved: true };
      days[s.rolloverPending.date] = from;
      const bring = s.rolloverPending.tasks.filter(t => selectedIds.has(t.id)).map(t => ({ id: newId(), text: t.text, category: t.category, priority: t.priority, done: false }));
      const todayEntry = { ...(days[s.todayDate] || { ...EMPTY_DAY }) };
      todayEntry.tasks = [...todayEntry.tasks, ...bring];
      days[s.todayDate] = todayEntry;
      save({ days });
      pushDayToCloud(s.rolloverPending.date, days[s.rolloverPending.date]);
      pushDayToCloud(s.todayDate, days[s.todayDate]);
      return { ...s, days, rolloverPending: null };
    });
  }
  function skipRollover() {
    setState(s => {
      const days = { ...s.days };
      const from = { ...(days[s.rolloverPending.date] || { ...EMPTY_DAY }), resolved: true };
      days[s.rolloverPending.date] = from;
      save({ days });
      pushDayToCloud(s.rolloverPending.date, days[s.rolloverPending.date]);
      return { ...s, days, rolloverPending: null };
    });
  }

  // ---- settings ----
  const openSettings = () => patch(s => ({ showSettings: true, apiKeyDraft: '', settingsSaved: false }));
  const closeSettings = () => patch({ showSettings: false });
  const onApiKeyDraft = (e) => patch({ apiKeyDraft: e.target.value });
  async function saveApiKey() {
    if (!hasBridge) return;
    await window.sprout.setApiKey(state.apiKeyDraft);
    patch({ apiKeyPresent: !!state.apiKeyDraft.trim(), apiKeyDraft: '', settingsSaved: true });
  }
  async function clearApiKey() {
    if (!hasBridge) return;
    await window.sprout.clearApiKey();
    patch({ apiKeyPresent: false, apiKeyDraft: '', settingsSaved: false });
  }
  const logout = () => { if (supabaseConfigured) supabase.auth.signOut(); };

  // ================= derived render values =================
  const s = state;

  if (!s.authChecked) {
    return (
      <div className={`sprout-app-shell${hasBridge ? '' : ' browser-mode'}`}>
        <div style={{ width: 420, maxWidth: '100%', height: 640, borderRadius: 26, background: '#F3E7D7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 26px 64px -20px rgba(50,32,16,.45)' }}>
          <div style={{ width: 28, height: 28, border: '3px solid rgba(90,70,52,.25)', borderTopColor: '#5A4634', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        </div>
      </div>
    );
  }
  if (supabaseConfigured && !s.session) {
    return (
      <div className={`sprout-app-shell${hasBridge ? '' : ' browser-mode'}`}>
        <Auth />
      </div>
    );
  }

  const theme = THEMES[s.theme] || THEMES.cozy;
  const isLive = !s.viewingDate;
  const activeDate = s.viewingDate || s.todayDate;
  const activeDay = s.days[activeDate] || EMPTY_DAY;
  const tasks = activeDay.tasks, done = tasks.filter(t => t.done).length, total = tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const mood = total === 0 ? 'idle' : done === total ? 'ecstatic' : done / total >= 0.5 ? 'happy' : done > 0 ? 'neutral' : 'meh';
  const f = face(mood);
  const leafScale = 0.55 + (pct / 100) * 0.55;

  const defaults = { idle: 'Hey! Ready to make today nice? 🌙', meh: "Nothing done yet... I'm watching 👀", neutral: "We're rolling. Keep it up!", happy: "You're on a roll 🔥", ecstatic: "ALL done. I'm so proud 🥹" };
  const speechMsg = isLive ? (s.mascotMsg || defaults[mood]) : defaults[mood];

  const swatch = { cozy: 'linear-gradient(135deg,#F3E7D7 50%,#E8956B 50%)', dark: 'linear-gradient(135deg,#241F30 50%,#B79CED 50%)', sketch: 'linear-gradient(135deg,#FFFFFF 50%,#F0803C 50%)' };
  const titles = { cozy: 'Cozy', dark: 'Moody', sketch: 'Sketch' };

  const tabDefs = [['today', '☑︎ Today'], ['focus', '⏱ Focus'], ['notes', '✎ Notes']];
  const tabBase = { flex: 1, padding: '10px 0', borderRadius: '12px 12px 0 0', border: 'none', background: 'transparent', color: 'var(--muted)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', ...noDrag };

  const circ = 2 * Math.PI * 86;
  const totalSecs = s.mode === 'focus' ? s.focusMinutes * 60 : s.breakMinutes * 60;
  const dashoff = circ * (1 - s.secondsLeft / totalSecs);
  const mm = String(Math.floor(s.secondsLeft / 60)).padStart(2, '0');
  const ss = String(s.secondsLeft % 60).padStart(2, '0');
  const modeBtnBase = { padding: '8px 16px', borderRadius: '9px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--muted)', ...noDrag };
  const modeActive = { ...modeBtnBase, background: 'var(--card)', color: 'var(--text)', boxShadow: '0 2px 8px -3px rgba(0,0,0,.3)' };
  const activeMinutes = s.mode === 'focus' ? s.focusMinutes : s.breakMinutes;
  const chipStyle = (active) => ({ padding: '6px 12px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: active ? 'var(--accent)' : 'var(--chip,#fbf3ea)', color: active ? '#fff' : 'var(--muted,#a08b76)' });

  const rootStyle = {
    width: '420px', maxWidth: '100%', height: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', borderRadius: '26px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)',
    boxShadow: '0 26px 64px -20px rgba(50,32,16,.45)', position: 'relative', WebkitAppRegion: 'drag', ...theme,
  };

  return (
    <div className={`sprout-app-shell${hasBridge ? '' : ' browser-mode'}`}>
      <div style={rootStyle}>

        {/* starfield */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 + pct / 100 * 0.6, pointerEvents: 'none', transition: 'opacity .6s ease' }}>
          {STAR_DEFS.map((st, i) => (
            <div key={i} style={{ position: 'absolute', top: st.t + '%', left: st.l + '%', width: st.s + 'px', height: st.s + 'px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)', animation: `twinkle ${2.4 + (i % 4) * 0.7}s ease-in-out ${st.d}s infinite` }} />
          ))}
        </div>

        {/* drag handle */}
        <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 38, height: 4, borderRadius: 4, background: 'var(--line,#e5d6c4)', opacity: .7, zIndex: 2 }} />

        {/* theme switcher + settings */}
        <div style={{ position: 'absolute', top: 16, right: 18, display: 'flex', gap: 8, zIndex: 5, ...noDrag }}>
          {['cozy', 'dark', 'sketch'].map(k => (
            <button
              key={k}
              onClick={() => setTheme(k)}
              title={titles[k]}
              style={{
                width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', padding: 0, background: swatch[k],
                border: k === 'sketch' ? '1.5px solid #2C2A26' : 'none',
                boxShadow: s.theme === k ? '0 0 0 2.5px var(--bg), 0 0 0 4.5px var(--text)' : 'none',
                transform: s.theme === k ? 'scale(1.08)' : 'scale(1)', transition: 'all .15s',
              }}
            />
          ))}
          <button
            onClick={openSettings}
            title="AI settings"
            style={{ width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', padding: 0, background: 'var(--chip,#fbf3ea)', border: '1.5px solid var(--line,#ead9c6)', color: 'var(--muted,#a08b76)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >{'⚙'}</button>
        </div>

        {/* HEADER */}
        <div style={{ padding: '26px 20px 14px', flex: '0 0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, paddingRight: 70 }}>
            {/* mascot */}
            <div style={{ width: 62, height: 70, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'bob 3.6s ease-in-out infinite', flex: '0 0 auto' }}>
              <div style={{ position: 'absolute', top: -9, right: 2, transform: `scale(${leafScale})`, transformOrigin: 'center', transition: 'transform .4s ease', zIndex: 2, fontSize: 14, color: '#F5C86B', textShadow: '0 0 8px rgba(245,200,107,.8)', lineHeight: 1 }}>{'✦'}</div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #FCF6DD, #EFE0B0)', border: '2px var(--st,solid) rgba(180,150,90,.35)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: `0 0 ${18 + pct / 100 * 24}px rgba(248,232,170,${0.4 + pct / 100 * 0.45}), 0 4px 12px -6px rgba(0,0,0,.3)`, transition: 'box-shadow .5s ease' }}>
                <div style={{ position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'rgba(120,95,40,.12)' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 8, width: 5, height: 5, borderRadius: '50%', background: 'rgba(120,95,40,.12)' }} />
                <div style={{ display: 'flex', gap: 9 }}>
                  <div style={f.eye} />
                  <div style={f.eye} />
                </div>
                <div style={f.mouth} />
                {f.cheeks && (
                  <>
                    <div style={{ position: 'absolute', left: 7, top: 31, width: 7, height: 7, borderRadius: '50%', background: 'rgba(232,124,107,.55)' }} />
                    <div style={{ position: 'absolute', right: 7, top: 31, width: 7, height: 7, borderRadius: '50%', background: 'rgba(232,124,107,.55)' }} />
                  </>
                )}
              </div>
              {s.celebrate && SPARKLE_DEFS.map((sp, i) => (
                <div key={i} style={{ position: 'absolute', left: '50%', top: '42%', marginLeft: sp.x, marginTop: sp.y, fontSize: 12, color: '#F5C86B', textShadow: '0 0 6px rgba(245,200,107,.9)', pointerEvents: 'none', animation: `burst 1.2s ease-out ${i * 0.12}s infinite` }}>{'✦'}</div>
              ))}
            </div>
            {/* speech bubble */}
            <div style={{ position: 'relative', flex: 1, background: 'var(--card,#fff)', border: '2px var(--st,solid) var(--line,#ead9c6)', borderRadius: 16, padding: '10px 13px', minHeight: 52, display: 'flex', alignItems: 'center', boxShadow: '0 4px 14px -8px rgba(0,0,0,.25)' }}>
              {s.talking ? (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted,#aaa)', animation: 'dots 1.2s infinite' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted,#aaa)', animation: 'dots 1.2s .2s infinite' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted,#aaa)', animation: 'dots 1.2s .4s infinite' }} />
                </div>
              ) : (
                <span style={{ fontSize: 13.5, lineHeight: 1.35, fontWeight: 500, color: 'var(--text,#5a4634)' }}>{speechMsg}</span>
              )}
              <div style={{ position: 'absolute', left: -8, bottom: 15, width: 14, height: 14, background: 'var(--card,#fff)', borderLeft: '2px var(--st,solid) var(--line,#ead9c6)', borderBottom: '2px var(--st,solid) var(--line,#ead9c6)', transform: 'rotate(45deg)' }} />
            </div>
            <button onClick={isLive ? talkToMascot : undefined} disabled={!isLive} title={isLive ? 'Talk to Sprout' : 'Back to Today to chat'} style={{ flex: '0 0 auto', width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--accent,#e8956b)', color: '#fff', fontSize: 15, cursor: isLive ? 'pointer' : 'default', opacity: isLive ? 1 : .4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -4px var(--accent,#e8956b)', alignSelf: 'flex-end', ...noDrag }}>{'❝'}</button>
          </div>

          {/* progress */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted,#a08b76)', letterSpacing: .3 }}>{isLive ? "TODAY'S PROGRESS" : formatLabel(activeDate, { month: 'short', day: 'numeric' }).toUpperCase() + ' · RECAP'}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text,#5a4634)' }}>{done}/{total}</span>
            </div>
            <div style={{ height: 9, borderRadius: 9, background: 'var(--chip,#fbf3ea)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', borderRadius: 9, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', transition: 'width .4s ease' }} />
            </div>
            {!isLive && (
              <button onClick={backToToday} style={{ marginTop: 8, padding: '5px 12px', borderRadius: 20, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--text,#5a4634)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', ...noDrag }}>{'← Back to Today'}</button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 6, padding: '4px 20px 0', flex: '0 0 auto', position: 'relative', zIndex: 1 }}>
          {tabDefs.map(([k, label]) => (
            <button
              key={k}
              onClick={k === 'today' ? onTodayTabClick : () => setTab(k)}
              style={s.tab === k ? { ...tabBase, background: 'var(--card)', color: 'var(--text)', fontWeight: 700, boxShadow: '0 -2px 10px -6px rgba(0,0,0,.3)' } : tabBase}
            >{label}</button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="sprout-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px', position: 'relative', zIndex: 1, ...noDrag }}>

          {s.tab === 'today' && (
            <div>
              {isLive ? (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input value={s.newTask} onChange={onNewTask} onKeyDown={onNewTaskKey} placeholder="Add a task…" style={{ flex: 1, padding: '11px 14px', borderRadius: 13, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'var(--input,#fbf3ea)', color: 'var(--text,#5a4634)', fontSize: 14, fontWeight: 500, outline: 'none' }} />
                    <button onClick={addManual} style={{ flex: '0 0 auto', width: 44, borderRadius: 13, border: 'none', background: 'var(--accent,#e8956b)', color: '#fff', fontSize: 22, cursor: 'pointer' }}>+</button>
                  </div>

                  <button onClick={toggleDump} style={{ width: '100%', textAlign: 'left', padding: '9px 13px', borderRadius: 12, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--muted,#a08b76)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{'🧠'} Brain dump — let AI sort it</span>
                    <span style={{ display: 'inline-block', transform: s.dumpOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', fontSize: 15 }}>{'⌄'}</span>
                  </button>

                  {s.dumpOpen && (
                    <div style={{ marginBottom: 14, animation: 'rise .25s ease' }}>
                      <textarea value={s.dumpText} onChange={onDump} placeholder="Type everything swirling in your head — one big mess is fine. Sprout will untangle it into clean tasks with categories & priorities." rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: 13, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'var(--input,#fbf3ea)', color: 'var(--text,#5a4634)', fontSize: 13.5, lineHeight: 1.45, outline: 'none' }} />
                      <button onClick={aiSort} disabled={s.sorting} style={{ marginTop: 8, width: '100%', padding: 11, borderRadius: 13, border: 'none', background: s.sorting ? 'var(--muted)' : 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: s.sorting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {s.sorting ? (
                          <>
                            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                            <span>Untangling…</span>
                          </>
                        ) : (
                          <span>{'✨'} Sort into tasks</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text,#5a4634)' }}>{'📅'} Recap · {formatLabel(activeDate)}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted,#a08b76)', marginTop: 2 }}>Past days are read-only.</div>
                </div>
              )}

              {total > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tasks.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 12px', borderRadius: 14, background: 'var(--card)', border: '2px var(--st,solid) var(--line)', opacity: t.done ? 0.62 : (isLive ? 1 : 0.9), transition: 'opacity .2s' }}>
                      <button onClick={isLive ? () => toggleTask(t.id) : undefined} disabled={!isLive} style={{ flex: '0 0 auto', width: 23, height: 23, marginTop: 1, borderRadius: 8, cursor: isLive ? 'pointer' : 'default', border: t.done ? 'none' : '2px var(--st,solid) var(--line)', background: t.done ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                        {t.done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{'✓'}</span>}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35, textDecoration: t.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{t.text}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: '#fff', background: CATS[t.category] || CATS.General, letterSpacing: .2 }}>{t.category}</span>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIO[t.priority] || PRIO.medium, display: 'inline-block' }} />
                          <span style={{ fontSize: 10.5, color: 'var(--muted,#a08b76)', textTransform: 'capitalize' }}>{t.priority}</span>
                        </div>
                      </div>
                      {isLive && <button onClick={() => removeTask(t.id)} style={{ flex: '0 0 auto', width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--muted,#a08b76)', fontSize: 16, cursor: 'pointer', opacity: .5, borderRadius: 8 }}>{'×'}</button>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--muted,#a08b76)' }}>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>{'🌙'}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{isLive ? 'All clear! Add a task or dump your brain above.' : 'No tasks logged this day.'}</div>
                </div>
              )}
            </div>
          )}

          {s.tab === 'focus' && (
            isLive ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                <div style={{ display: 'flex', gap: 6, background: 'var(--chip,#fbf3ea)', padding: 4, borderRadius: 12, marginBottom: 16 }}>
                  <button onClick={setFocusMode} style={s.mode === 'focus' ? modeActive : modeBtnBase}>Focus</button>
                  <button onClick={setBreakMode} style={s.mode === 'break' ? modeActive : modeBtnBase}>{'🍵'} Break</button>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8, ...noDrag }}>
                  {TIMER_PRESETS.map(m => (
                    <button key={m} onClick={() => applyPreset(m)} style={chipStyle(activeMinutes === m && !customOpen)}>{m}m</button>
                  ))}
                  <button onClick={() => setCustomOpen(v => !v)} style={chipStyle(customOpen || !TIMER_PRESETS.includes(activeMinutes))}>Custom</button>
                </div>
                {customOpen && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, ...noDrag }}>
                    <input type="number" min="1" max="180" value={customDraft} onChange={e => setCustomDraft(e.target.value)} placeholder={String(activeMinutes)} style={{ width: 64, padding: '6px 8px', borderRadius: 9, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'var(--input,#fbf3ea)', color: 'var(--text,#5a4634)', fontSize: 12.5, outline: 'none' }} />
                    <span style={{ fontSize: 12, color: 'var(--muted,#a08b76)' }}>min</span>
                    <button onClick={applyCustom} style={{ padding: '6px 12px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Set</button>
                  </div>
                )}

                <div style={{ position: 'relative', width: 194, height: 194, marginTop: 8 }}>
                  <svg width="194" height="194" viewBox="0 0 194 194" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="97" cy="97" r="86" fill="none" stroke="var(--chip,#fbf3ea)" strokeWidth="12" />
                    <circle cx="97" cy="97" r="86" fill="none" stroke="var(--accent,#e8956b)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashoff} style={{ transition: 'stroke-dashoffset .5s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "var(--head,'Fredoka',sans-serif)", color: 'var(--text,#5a4634)', letterSpacing: 1 }}>{mm}:{ss}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted,#a08b76)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.mode === 'focus' ? 'Focus' : 'Break'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
                  <button onClick={toggleTimer} style={{ width: 62, height: 62, borderRadius: '50%', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 20, cursor: 'pointer', boxShadow: '0 8px 20px -6px var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.running ? '❚❚' : '▶'}</button>
                  <button onClick={resetTimer} style={{ width: 52, height: 52, borderRadius: '50%', border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--text,#5a4634)', fontSize: 18, cursor: 'pointer' }}>{'↺'}</button>
                </div>

                <div style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: 'var(--muted,#a08b76)' }}>
                  {activeDay.pomos} focus session{activeDay.pomos === 1 ? '' : 's'} today
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--muted,#a08b76)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{'⏱'}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text,#5a4634)' }}>{activeDay.pomos} focus session{activeDay.pomos === 1 ? '' : 's'}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>on {formatLabel(activeDate)}</div>
              </div>
            )
          )}

          {s.tab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {!isLive && <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted,#a08b76)', marginBottom: 6 }}>{'📅'} Notes from {formatLabel(activeDate)}</div>}
              <textarea
                value={activeDay.notes}
                onChange={isLive ? onNotes : undefined}
                readOnly={!isLive}
                placeholder="A little scratchpad for thoughts, links, half-ideas… anything that doesn't need a checkbox yet."
                style={{ flex: 1, minHeight: 280, width: '100%', padding: '15px 16px', borderRadius: 15, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'var(--input,#fbf3ea)', color: 'var(--text,#5a4634)', fontSize: 14, lineHeight: 1.6, outline: 'none', opacity: isLive ? 1 : .8 }}
              />
              <div style={{ textAlign: 'right', marginTop: 8, fontSize: 11.5, color: 'var(--muted,#a08b76)', fontWeight: 600 }}>{wordCount(activeDay.notes)} words{isLive ? ' · saved' : ''}</div>
            </div>
          )}

        </div>

        {s.showSettings && (
          <SettingsModal
            hasBridge={hasBridge}
            apiKeyPresent={s.apiKeyPresent}
            apiKeyDraft={s.apiKeyDraft}
            settingsSaved={s.settingsSaved}
            onChangeDraft={onApiKeyDraft}
            onSave={saveApiKey}
            onClear={clearApiKey}
            onClose={closeSettings}
            accountEmail={s.session ? s.session.user.email : null}
            onLogout={logout}
          />
        )}

        {s.showCalendar && (
          <CalendarModal
            year={calCursor.year}
            month={calCursor.month}
            days={s.days}
            viewingDate={s.viewingDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onSelect={selectDate}
            onClose={() => patch({ showCalendar: false })}
          />
        )}

        {s.rolloverPending && (
          <RolloverModal
            fromLabel={formatLabel(s.rolloverPending.date)}
            tasks={s.rolloverPending.tasks}
            onConfirm={resolveRollover}
            onSkip={skipRollover}
          />
        )}
      </div>
    </div>
  );
}
