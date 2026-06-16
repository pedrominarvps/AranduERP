'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin.length < 4) { setError('Ingrese el PIN de 4 dígitos'); return; }
    if (login(pin)) {
      router.replace('/pos');
    } else {
      setError('PIN incorrecto');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + d);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--ink, #0F172A)', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface, #1E293B)', borderRadius: '20px', padding: '2.5rem 2rem',
        width: '100%', maxWidth: '360px', border: '1px solid var(--border, rgba(255,255,255,0.07))',
        boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.5))',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Arandu ERP" style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '1rem' }} />
          <h1 style={{ fontFamily: 'var(--font-display, Inter)', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Arandu ERP</h1>
          <p style={{ color: 'var(--text-3, #64748B)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Ingrese su PIN de acceso</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem',
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: '48px', height: '56px', borderRadius: '12px',
                background: 'var(--surface-2, #334155)',
                border: pin[i] ? '2px solid var(--amber, #F59E0B)' : '2px solid var(--border, rgba(255,255,255,0.07))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)',
                transition: 'border-color 0.15s ease',
              }}>
                {pin[i] ? '●' : ''}
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: 'var(--crimson, #EF4444)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginBottom: '1rem' }}>
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} type="button" onClick={() => handleDigit(d)} style={{
                padding: '0.875rem', fontSize: '1.25rem', fontWeight: 600,
                background: 'var(--surface-2, #334155)', border: '1px solid var(--border, rgba(255,255,255,0.06))',
                borderRadius: '12px', color: 'var(--text-1, #F1F5F9)', cursor: 'pointer',
                transition: 'background 0.12s ease',
              }}
                onMouseDown={e => (e.currentTarget.style.background = 'var(--amber-glow, rgba(245,158,11,0.15))')}
                onMouseUp={e => (e.currentTarget.style.background = 'var(--surface-2, #334155)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2, #334155)')}
              >{d}</button>
            ))}
            <button type="button" onClick={() => handleDigit('.')} disabled style={{
              padding: '0.875rem', fontSize: '1.25rem', fontWeight: 600,
              background: 'var(--surface-2, #334155)', border: '1px solid var(--border, rgba(255,255,255,0.06))',
              borderRadius: '12px', color: 'var(--text-3, #64748B)', cursor: 'default', opacity: 0.4,
            }}>.</button>
            <button type="button" onClick={() => handleDigit('0')} style={{
              padding: '0.875rem', fontSize: '1.25rem', fontWeight: 600,
              background: 'var(--surface-2, #334155)', border: '1px solid var(--border, rgba(255,255,255,0.06))',
              borderRadius: '12px', color: 'var(--text-1, #F1F5F9)', cursor: 'pointer',
              transition: 'background 0.12s ease',
            }}
              onMouseDown={e => (e.currentTarget.style.background = 'var(--amber-glow, rgba(245,158,11,0.15))')}
              onMouseUp={e => (e.currentTarget.style.background = 'var(--surface-2, #334155)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2, #334155)')}
            >0</button>
            <button type="button" onClick={handleDelete} style={{
              padding: '0.875rem', fontSize: '1rem', fontWeight: 600,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', color: 'var(--crimson, #EF4444)', cursor: 'pointer',
            }}>⌫</button>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600,
            background: pin.length === 4 ? 'var(--amber, #F59E0B)' : 'var(--surface-2, #334155)',
            border: 'none', borderRadius: '12px', color: pin.length === 4 ? '#0D1117' : 'var(--text-3, #64748B)',
            cursor: pin.length === 4 ? 'pointer' : 'default', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <Lock size={16} /> Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
