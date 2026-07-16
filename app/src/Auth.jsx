import React, { useState } from 'react';
import { supabase } from './supabaseClient.js';

const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 13, border: '2px solid #EAD9C6', background: '#FBF3EA', color: '#5A4634', fontSize: 14, fontWeight: 500, outline: 'none' };

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data && data.user && !data.session) {
          setInfo('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '420px', maxWidth: '100%', height: '640px', margin: '0 auto', borderRadius: '26px', background: '#F3E7D7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: "'Quicksand',sans-serif", boxShadow: '0 26px 64px -20px rgba(50,32,16,.45)' }}>
      <div style={{ fontSize: 40, marginBottom: 6 }}>{'🌙'}</div>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, fontWeight: 700, color: '#5A4634', marginBottom: 4 }}>Sprout</div>
      <div style={{ fontSize: 13, color: '#A08B76', marginBottom: 22, textAlign: 'center' }}>{mode === 'signin' ? 'Sign in to sync your to-dos' : 'Create an account to get started'}</div>

      <form onSubmit={submit} style={{ width: '100%', maxWidth: 280 }}>
        <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ ...inputStyle, marginTop: 10 }} />
        {error && <div style={{ color: '#E4655A', fontSize: 12, fontWeight: 600, marginTop: 10 }}>{error}</div>}
        {info && <div style={{ color: '#4FB98A', fontSize: 12, fontWeight: 600, marginTop: 10 }}>{info}</div>}
        <button type="submit" disabled={loading} style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 13, border: 'none', background: '#E8956B', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? .7 : 1 }}>
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <button
        onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
        style={{ marginTop: 16, background: 'transparent', border: 'none', color: '#A08B76', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
      >
        {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}
