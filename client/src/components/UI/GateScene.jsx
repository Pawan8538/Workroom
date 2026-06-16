import React, { useState, useEffect } from 'react';

const GateScene = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Call onComplete after door is fully open (1.5s + small delay for effect)
    setTimeout(() => {
      onComplete();
    }, 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999, // Extremely high to cover everything
      overflow: 'hidden'
    }}>
      
      {/* ── Background Light Spilling Out ── */}
      {/* This light grows and brightens as the door opens. Duplicate key "transform" is fixed. */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '300px',
        height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(0, 245, 255, 0.8) 0%, transparent 70%)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 1.5s ease-in, transform 1.5s ease-in',
        transform: isOpen ? 'translate(-50%, -50%) scale(3)' : 'translate(-50%, -50%) scale(1)',
        pointerEvents: 'none'
      }} />

      {/* ── Door Frame ── */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '200px',
          height: '400px',
          position: 'relative',
          perspective: '1200px',
          border: '4px solid #080808', // Dark frame
          borderBottom: 'none',
          boxShadow: 'inset 0 0 20px #000'
        }}
      >
        
        {/* Gap light under the door (faint before opening, vanishes when opening) */}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            width: '100%',
            height: '2px',
            background: '#00f5ff',
            boxShadow: '0 0 15px 2px #00f5ff',
            opacity: isHovered ? 0.7 : 0.3,
            transition: 'opacity 0.5s ease'
          }} />
        )}

        {/* ── The Door Itself ── */}
        {/* Hovering the handle creaks the door open by 5 degrees very slowly. */}
        {/* Clicking it triggers the complete 95-degree open animation. */}
        <div 
          onClick={handleOpen}
          style={{
          width: '100%',
          height: '100%',
          background: '#0a0805', // Very dark wood color
          border: '1px solid #111',
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: 'left',
          cursor: 'pointer',
          transition: isOpen 
            ? 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 4.0s cubic-bezier(0.1, 0.9, 0.2, 1)', // Slow creak when hovered
          transform: isOpen 
            ? 'rotateY(-95deg)' 
            : (isHovered ? 'rotateY(-45deg)' : 'rotateY(0deg)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end', // Put handle on the right
          boxShadow: isOpen ? 'none' : 'inset -5px 0 20px rgba(0,0,0,0.8)'
        }}>
          
          {/* Faint wood paneling lines */}
          <div style={{
            position: 'absolute', inset: '10px', border: '1px solid #15100a', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', inset: '20px', border: '1px solid #15100a', pointerEvents: 'none'
          }} />

          {/* ── Metal Handle Wrapper to prevent hover flickering during door rotation ── */}
          <div
            style={{
              padding: '10px 20px', // Extra hitbox padding to keep mouse hover stable
              marginRight: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            {/* The physical metal handle */}
            <div 
              style={{
                width: '15px',
                height: '40px',
                background: '#222',
                borderRadius: '2px',
                border: '1px solid #333',
                boxShadow: isHovered ? '0 0 12px #00f5ff, inset 0 0 5px #444' : 'inset 0 0 5px #111',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default GateScene;
