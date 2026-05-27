import React from 'react';

const SpeechBubble = ({ text, agentColor, visible, screenX, screenY }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -100%)', // Center horizontally and place above coordinates
        marginTop: '-16px', // Offset to float slightly above the agent
        backgroundColor: '#0a0a0f',
        border: `1px solid ${agentColor || '#444'}`,
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '6px 10px',
        maxWidth: '180px',
        pointerEvents: 'none',
        zIndex: 500,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        borderRadius: '4px',
        textAlign: 'center',
        wordWrap: 'break-word',
      }}
    >
      {text}
      
      {/* Outer Triangle (Border) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${agentColor || '#444'}`,
        }}
      />
      {/* Inner Triangle (Background) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid #0a0a0f',
        }}
      />
    </div>
  );
};

export default SpeechBubble;
