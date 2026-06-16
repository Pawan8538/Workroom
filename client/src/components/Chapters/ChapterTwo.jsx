import React, { useState } from 'react';

export default function ChapterTwo({ onSubmitForm }) {
  const [formData, setFormData] = useState({ name: '', role: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.company) return;
    setIsSubmitting(true);

    try {
      const sessionId = window.__doorkeeper?.sessionId || 'sess_' + Math.random().toString(36).substr(2, 9);
      await fetch('http://localhost:5000/api/chapter2/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sessionId })
      }).catch(() => {});

      const role = formData.role.toLowerCase();
      if (role === 'student' || role === 'other') {
        setResultMsg('Request received. You will be informed on mail very soon.');
        // Notify parent to close without approval
        setTimeout(() => onSubmitForm(false), 4000);
      } else {
        // Auto-approve
        setResultMsg('Access Granted. The Architect is ready.');
        setTimeout(() => onSubmitForm(true), 2000);
      }
    } catch (err) {
      onSubmitForm(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      color: '#fff', fontFamily: 'monospace'
    }}>
      <div style={{
        background: '#111', padding: '40px', border: '1px solid #333',
        width: '400px', display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '2px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          CHAPTER 2: AUTHORIZATION
        </h2>
        
        {resultMsg ? (
          <div style={{ color: resultMsg.includes('Granted') ? '#00ff00' : '#cccccc', lineHeight: 1.6 }}>
            {resultMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>NAME</label>
              <input 
                type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '10px', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>DESIGNATION</label>
              <select 
                required value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '10px', fontFamily: 'monospace', outline: 'none' }}
              >
                <option value="">Select Role...</option>
                <option value="Student">Student</option>
                <option value="CEO/CTO">CEO / CTO</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Recruiter">Recruiter / Talent</option>
                <option value="Senior Engineer">Senior Engineer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>CURRENT COMPANY / INSTITUTION</label>
              <input 
                type="text" required value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '10px', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>
            
            <button 
              type="submit" disabled={isSubmitting}
              style={{
                marginTop: '10px', background: 'transparent', border: '1px solid #fff',
                color: '#fff', padding: '12px', cursor: 'pointer', fontFamily: 'monospace',
                letterSpacing: '2px', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#222'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {isSubmitting ? 'VERIFYING...' : 'REQUEST ACCESS'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

