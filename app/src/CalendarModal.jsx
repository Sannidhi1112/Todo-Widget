import React from 'react';
import { monthMatrix, pad2, todayKey } from './dateUtils.js';

const noDrag = { WebkitAppRegion: 'no-drag' };
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarModal({ year, month, days, viewingDate, onPrevMonth, onNextMonth, onSelect, onClose }) {
  const cells = monthMatrix(year, month);
  const today = todayKey();
  const isCurrentMonth = year === Number(today.slice(0, 4)) && month === Number(today.slice(5, 7)) - 1;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(20,14,8,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, ...noDrag }}>
      <div style={{ width: '100%', maxWidth: 320, background: 'var(--card,#fff)', border: '2px var(--st,solid) var(--line,#ead9c6)', borderRadius: 'var(--rad,18px)', padding: 18, boxShadow: '0 20px 50px -16px rgba(0,0,0,.5)', filter: 'var(--sketchy-filter,none)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button onClick={onPrevMonth} style={{ width: 26, height: 26, border: 'none', background: 'var(--chip,#fbf3ea)', color: 'var(--text,#5a4634)', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>{'‹'}</button>
          <span style={{ fontFamily: "var(--head,'Fredoka',sans-serif)", fontSize: 15, fontWeight: 700, color: 'var(--text,#5a4634)' }}>{MONTH_NAMES[month]} {year}</span>
          <button onClick={onNextMonth} disabled={isCurrentMonth} style={{ width: 26, height: 26, border: 'none', background: 'var(--chip,#fbf3ea)', color: isCurrentMonth ? 'var(--muted,#a08b76)' : 'var(--text,#5a4634)', borderRadius: 8, fontSize: 14, cursor: isCurrentMonth ? 'default' : 'pointer', opacity: isCurrentMonth ? .4 : 1 }}>{'›'}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
          {WEEKDAYS.map((w, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--muted,#a08b76)' }}>{w}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {cells.map((key, i) => {
            if (!key) return <div key={i} />;
            const entry = days[key];
            const total = entry ? entry.tasks.length : 0;
            const done = entry ? entry.tasks.filter(t => t.done).length : 0;
            const pct = total ? done / total : 0;
            const isFuture = key > today;
            const isToday = key === today;
            const isViewing = viewingDate ? key === viewingDate : isToday;
            const dayNum = Number(key.slice(-2));
            return (
              <button
                key={i}
                onClick={() => !isFuture && onSelect(key)}
                disabled={isFuture}
                title={key}
                style={{
                  position: 'relative', height: 34, border: 'none', borderRadius: 10, cursor: isFuture ? 'default' : 'pointer',
                  background: isViewing ? 'var(--accent)' : 'transparent',
                  color: isViewing ? '#fff' : isFuture ? 'var(--muted,#a08b76)' : 'var(--text,#5a4634)',
                  opacity: isFuture ? .35 : 1,
                  fontWeight: isToday ? 800 : 600, fontSize: 12.5,
                  boxShadow: isToday && !isViewing ? 'inset 0 0 0 1.5px var(--accent)' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                }}
              >
                <span>{dayNum}</span>
                {total > 0 && (
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: isViewing ? '#fff' : 'var(--accent)', opacity: Math.max(pct, .35) }} />
                )}
              </button>
            );
          })}
        </div>

        <button onClick={onClose} style={{ marginTop: 14, width: '100%', padding: 9, borderRadius: 11, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--text,#5a4634)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}
