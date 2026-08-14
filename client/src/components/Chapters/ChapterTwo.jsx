import React, { useState } from 'react';

export default function ChapterTwo({ onSubmitForm }) {
  const [formData, setFormData] = useState({ name: '', role: '', company: '', linkedin: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultGranted, setResultGranted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.company) return;
    setIsSubmitting(true);

    const role = formData.role.toLowerCase();
    if (role === 'student' && !formData.linkedin) {
      setErrorMsg('Please provide LinkedIn or Contact details.');
      setIsSubmitting(false);
      return;
    }
    setErrorMsg('');

    try {
      const sessionId = window.__doorkeeper?.sessionId || 'sess_' + Math.random().toString(36).substr(2, 9);
      await fetch('http://localhost:5000/api/chapter2/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, role: formData.role, whatBuilding: formData.company, linkedin: formData.linkedin, sessionId })
      }).catch(() => {});

      if (role === 'student') {
        setResultGranted(false);
        setResultMsg('Credentials received. We will contact you with Chapter 2 access later. You can still observe the Workroom and find hidden details.');
        setTimeout(() => onSubmitForm('student'), 6000);
      } else {
        setResultGranted(true);
        setResultMsg('Identity Confirmed. Access Granted.');
        setTimeout(() => onSubmitForm(true), 2000);
      }
    } catch (err) {
      onSubmitForm(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(10,8,4,0.8)',
    border: '1px solid rgba(212,175,55,0.2)',
    color: '#f0e8d0',
    padding: '13px 16px',
    fontFamily: 'monospace',
    fontSize: '13px',
    outline: 'none',
    borderRadius: '2px',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 10,
    cursor: 'text',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(12px)',
      background: 'radial-gradient(ellipse at center, rgba(20,14,5,0.85) 0%, rgba(0,0,0,0.92) 100%)',
    }}>
      <div style={{
        width: '420px',
        background: '#0d0d0d', // Solid dark material
        borderRadius: '6px',
        border: '1px solid #222',
        boxShadow: '0 24px 64px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent */}
        <div style={{ height: '4px', background: '#d4af37', width: '100%' }} />

        <div style={{ padding: '48px 40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(212,175,55,0.5)', fontFamily: 'monospace', marginBottom: '16px' }}>
              CHAPTER 2 ACCESS REQUEST
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 400, letterSpacing: '8px', color: '#fff', fontFamily: 'Georgia, serif', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Authorization
            </h2>
          </div>

          {resultMsg ? (
            <div style={{
              padding: '20px',
              border: `1px solid ${resultGranted ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '2px',
              background: resultGranted ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.03)',
              color: resultGranted ? '#d4af37' : '#aaa',
              fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.7', letterSpacing: '0.5px',
            }}>
              {resultGranted ? '▶ ' : '— '}{resultMsg}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', zIndex: 100 }}>
              <div style={{ position: 'relative', zIndex: 110 }}>
                <label style={{ display: 'block', fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  FULL NAME
                </label>
                <input
                  type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ position: 'relative', zIndex: 110 }}>
                <label style={{ display: 'block', fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  DESIGNATION
                </label>
                <select
                  required value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Select Role...</option>
                  <option value="Student">Student</option>
                  <option value="CEO/CTO">CEO / CTO</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Recruiter">Recruiter / Talent</option>
                  <option value="Senior Engineer">Senior Engineer</option>
                </select>
              </div>

              <div style={{ position: 'relative', zIndex: 110 }}>
                <label style={{ display: 'block', fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  COMPANY / INSTITUTION
                </label>
                <input
                  type="text" required value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ position: 'relative', zIndex: 110 }}>
                {errorMsg && (
                  <div style={{
                    marginBottom: '10px',
                    color: '#ff4444',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    letterSpacing: '0.5px'
                  }}>
                    — {errorMsg}
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px', fontFamily: 'monospace', pointerEvents: 'none' }}>
                  <span>LINKEDIN URL</span>
                  <span style={{ fontSize: '8px', color: 'rgba(212,175,55,0.3)', letterSpacing: '1px' }}>(OPTIONAL)</span>
                </label>
                <input
                  type="url" value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  style={inputStyle}
                  placeholder="https://linkedin.com/in/..."
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 1px rgba(212,175,55,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                style={{
                  marginTop: '8px',
                  background: isSubmitting ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.5)',
                  color: '#d4af37',
                  padding: '14px',
                  cursor: isSubmitting ? 'default' : 'pointer',
                  fontFamily: 'monospace',
                  letterSpacing: '4px',
                  fontSize: '12px',
                  transition: 'all 0.25s ease',
                  borderRadius: '2px',
                  width: '100%',
                }}
                onMouseEnter={e => { if (!isSubmitting) { e.target.style.background = 'rgba(212,175,55,0.15)'; e.target.style.boxShadow = '0 0 20px rgba(212,175,55,0.15)'; } }}
                onMouseLeave={e => { e.target.style.background = 'rgba(212,175,55,0.06)'; e.target.style.boxShadow = 'none'; }}
              >
                {isSubmitting ? 'VERIFYING...' : 'REQUEST ACCESS'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
