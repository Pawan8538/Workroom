import React from 'react';
import { PAPER_LAYER_ONE } from '../../constants/PAPER_TEXT';

const Day47Modal = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#eae5d8',
          color: '#1a1a1a',
          padding: '40px',
          maxWidth: '500px',
          fontFamily: 'monospace',
          fontSize: '16px',
          lineHeight: '1.6',
          boxShadow: '0 0 40px rgba(0,0,0,0.6)',
          transform: 'rotate(-2deg)',
          whiteSpace: 'pre-wrap',
          cursor: 'default',
        }}
      >
        {PAPER_LAYER_ONE}
      </div>
    </div>
  );
};

export default Day47Modal;
