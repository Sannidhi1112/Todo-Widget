import React from 'react';

const noDrag = { WebkitAppRegion: 'no-drag' };

export default function SettingsModal({ hasBridge, apiKeyPresent, apiKeyDraft, settingsSaved, onChangeDraft, onSave, onClear, onClose, accountEmail, onLogout }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(20,14,8,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, ...noDrag }}>
      <div style={{ width: '100%', maxWidth: 320, background: 'var(--card,#fff)', border: '2px var(--st,solid) var(--line,#ead9c6)', borderRadius: 'var(--rad,18px)', padding: 20, boxShadow: '0 20px 50px -16px rgba(0,0,0,.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--head,'Fredoka',sans-serif)", fontSize: 16, fontWeight: 700, color: 'var(--text,#5a4634)' }}>Settings</span>
          <button onClick={onClose} style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--muted,#a08b76)', fontSize: 16, cursor: 'pointer' }}>{'×'}</button>
        </div>

        {accountEmail && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 11, background: 'var(--input,#fbf3ea)', marginBottom: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted,#a08b76)', textTransform: 'uppercase', letterSpacing: .3 }}>Signed in as</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text,#5a4634)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{accountEmail}</div>
            </div>
            <button onClick={onLogout} style={{ flex: '0 0 auto', padding: '7px 12px', borderRadius: 9, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--text,#5a4634)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Log out</button>
          </div>
        )}

        <span style={{ display: 'block', fontFamily: "var(--head,'Fredoka',sans-serif)", fontSize: 13.5, fontWeight: 700, color: 'var(--text,#5a4634)', marginBottom: 8 }}>AI settings</span>

        {!hasBridge ? (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--muted,#a08b76)', fontWeight: 500 }}>
            AI brain-dump sorting and mascot replies need the Sprout desktop app — this browser preview uses local fallbacks instead.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted,#a08b76)', fontWeight: 500, marginBottom: 12 }}>
              Add your Anthropic API key to enable AI brain-dump sorting and mascot replies. It's stored only on this device. Without a key, Sprout falls back to simple local sorting and canned mascot lines.
            </p>
            <input
              type="password"
              value={apiKeyDraft}
              onChange={onChangeDraft}
              placeholder={apiKeyPresent ? 'Key saved — enter a new one to replace it' : 'sk-ant-...'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 11, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'var(--input,#fbf3ea)', color: 'var(--text,#5a4634)', fontSize: 13, outline: 'none', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button onClick={onSave} disabled={!apiKeyDraft.trim()} style={{ flex: 1, padding: '9px', borderRadius: 11, border: 'none', background: 'var(--accent,#e8956b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: apiKeyDraft.trim() ? 'pointer' : 'default', opacity: apiKeyDraft.trim() ? 1 : .5 }}>Save key</button>
              <button onClick={onClear} disabled={!apiKeyPresent} style={{ flex: 1, padding: '9px', borderRadius: 11, border: '2px var(--st,solid) var(--line,#ead9c6)', background: 'transparent', color: 'var(--text,#5a4634)', fontSize: 13, fontWeight: 700, cursor: apiKeyPresent ? 'pointer' : 'default', opacity: apiKeyPresent ? 1 : .5 }}>Clear</button>
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: apiKeyPresent ? 'var(--accent,#e8956b)' : 'var(--muted,#a08b76)' }}>
              {apiKeyPresent ? 'Key saved ✓' : 'No key set — using local fallbacks.'}
              {settingsSaved && apiKeyPresent ? ' Saved!' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
