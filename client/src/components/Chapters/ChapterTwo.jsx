import React from 'react';

const ChapterTwo = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff'
    }}>
      <h1>Access Restricted</h1>
      <p style={{ color: '#666' }}>Chapter 2 is currently locked.</p>
      <button style={{
        marginTop: '20px',
        padding: '10px 20px',
        background: '#333',
        border: '1px solid #444',
        color: '#fff',
        cursor: 'pointer'
      }}>
        Request Access
      </button>
    </div>
  );
};

export default ChapterTwo;
