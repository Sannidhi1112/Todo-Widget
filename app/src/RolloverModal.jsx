import React, { useState } from 'react';

const noDrag = { WebkitAppRegion: 'no-drag' };
const CATS = { Work: '#6C8AE4', Personal: '#E8956B', Health: '#4FB98A', Errands: '#D99A3D', Ideas: '#B98CE0', Urgent: '#E4655A', General: '#A99E90' };

export default function RolloverModal({ fromLabel, tasks, onConfirm, onSkip }) {
  const [selected, setSelected] = useState(() => new Set(tasks.map(t => t.id)));
  const toggle = (id) => setSelected(s => { const next = new Set(s); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(20,14,8,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, ...noDrag }}>
      <div style={{ width: '100%', maxWidth: 320, maxHeight: '80%', display: 'flex', flexDirection: 'column', background: 'var(--card,#fff)', border: '2px var(--st,solid) var(--line,#ead9c6)', borderRadius: 'var(--rad,18px)', padding: 20, boxShadow: '0 20px 50px -16px rgba(0,0,0,.5)' }}>
        <span style={{ fontFamily: "var(--head,'Fredoka',sans-serif)", fontSize: 16, fontWeight: 700, color: 'var(--text,#5a4634)' }}>Catching up</span>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted,#a08b76)', fontWeight: 500, margin: '6px 0 12px' }}>
          You had {tasks.length} unfinished task{tasks.length === 1 ? '' : 's'} on {fromLabel}. Bring any of them into today?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', marginBottom: 14 }}>
          {tasks.map(t => (
            <button key={t.id} onClick={() => toggle(t.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 10px', borderRadius: 12, background: 'var(--input,#fbf3ea)', border: '2px var(--st,solid) var(--line,#ead9c6)', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ flex: '0 0 auto', width: 19, height: 19, marginTop: 1, borderRadius: 7, border: selected.has(t.id) ? 'none' : '2px var(--st,solid) var(--line,#ead9c6)', background: selected.has(t.id) ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected.has(t.id) && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{'✓'}</span>}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--text,#5a4634)', lineHeight: 1.3 }}>{t.text}</span>
                <span style={{ display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, color: '#fff', background: CATS[t.category] || CATS.General }}>{t.category}</span>
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onConfirm(selected)} style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Add selected to today</button>
          <button onClick={onSkip} style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: 12, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--text,#5a4634)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Skip</button>
        </div>
      </div>
    </div>
  );
}
