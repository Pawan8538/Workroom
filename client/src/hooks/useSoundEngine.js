import React, { useEffect, useRef } from 'react';
import { SOUNDS } from '../constants/SOUNDS';

export function useSoundEngine() {
  const audioCtxRef = useRef(null);
  const soundsRef = useRef({
    ambientHum: null,
    keyboardLoop: null,
    meetingMuffled: null,
    // Store gain nodes
    gains: {
      ambientHum: null,
      keyboardLoop: null,
      meetingMuffled: null,
      clockTick: null,
      flicker: null,
      terminalTyping: null,
      orchestration: null
    },
    // Store source nodes
    sources: {
      ambientHum: null,
      keyboardLoop: null,
      meetingMuffled: null,
      clockTick: null,
      flicker: null,
      terminalTyping: null
    },
    // Track intervals
    clockInterval: null,
    // Fallback oscillator
    oscillator: null,
    oscillatorGain: null
  });

  // Lazy initialization of AudioContext
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      
      const ctx = audioCtxRef.current;

      // Create gain nodes for each type of sound
      soundsRef.current.gains.ambientHum = ctx.createGain();
      soundsRef.current.gains.ambientHum.gain.setValueAtTime(0.15, ctx.currentTime);
      soundsRef.current.gains.ambientHum.connect(ctx.destination);

      soundsRef.current.gains.keyboardLoop = ctx.createGain();
      soundsRef.current.gains.keyboardLoop.gain.setValueAtTime(0.75, ctx.currentTime);
      soundsRef.current.gains.keyboardLoop.connect(ctx.destination);

      soundsRef.current.gains.meetingMuffled = ctx.createGain();
      soundsRef.current.gains.meetingMuffled.gain.setValueAtTime(0.45, ctx.currentTime);
      soundsRef.current.gains.meetingMuffled.connect(ctx.destination);

      soundsRef.current.gains.meetingLaughter = ctx.createGain();
      soundsRef.current.gains.meetingLaughter.gain.setValueAtTime(0.35, ctx.currentTime);
      soundsRef.current.gains.meetingLaughter.connect(ctx.destination);

      soundsRef.current.gains.clockTick = ctx.createGain();
      soundsRef.current.gains.clockTick.gain.setValueAtTime(0.05, ctx.currentTime);
      soundsRef.current.gains.clockTick.connect(ctx.destination);

      soundsRef.current.gains.monitorFlicker = ctx.createGain();
      soundsRef.current.gains.monitorFlicker.gain.setValueAtTime(0.2, ctx.currentTime);
      soundsRef.current.gains.monitorFlicker.connect(ctx.destination);

      soundsRef.current.gains.flicker = ctx.createGain();
      soundsRef.current.gains.flicker.gain.setValueAtTime(0.3, ctx.currentTime);
      soundsRef.current.gains.flicker.connect(ctx.destination);

      soundsRef.current.gains.terminalTyping = ctx.createGain();
      soundsRef.current.gains.terminalTyping.gain.setValueAtTime(0.4, ctx.currentTime);
      soundsRef.current.gains.terminalTyping.connect(ctx.destination);

      soundsRef.current.gains.orchestration = ctx.createGain();
      soundsRef.current.gains.orchestration.gain.setValueAtTime(0.5, ctx.currentTime);
      soundsRef.current.gains.orchestration.connect(ctx.destination);

      console.log('[SoundEngine] AudioContext and GainNodes initialized.');
    } catch (e) {
      console.error('[SoundEngine] Failed to initialize AudioContext:', e);
    }
  };

  const unlockAudioContext = async () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended' && !document.hidden) {
      try {
        await ctx.resume();
        console.log('[SoundEngine] AudioContext resumed successfully.');
      } catch (err) {
        console.warn('[SoundEngine] AudioContext resume failed:', err);
      }
    }
  };

  // Helper to load/create loop sound
  const setupLoop = (soundKey, src, gainNode) => {
    if (!audioCtxRef.current) return;
    
    // If already setup, just return it
    if (soundsRef.current[soundKey]) return soundsRef.current[soundKey];

    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      // Connect to Web Audio graph
      const source = audioCtxRef.current.createMediaElementSource(audio);
      source.connect(gainNode);

      soundsRef.current[soundKey] = audio;
      soundsRef.current.sources[soundKey] = source;
      
      console.log(`[SoundEngine] Setup loop for ${soundKey} using ${src}`);
      return audio;
    } catch (e) {
      console.error(`[SoundEngine] Failed to setup loop for ${soundKey}:`, e);
      return null;
    }
  };

  const ambientHumPlayIntent = useRef(false);

  const playAmbientHum = () => {
    ambientHumPlayIntent.current = true;
    unlockAudioContext().then(() => {
      if (!ambientHumPlayIntent.current) return;
      const audio = setupLoop('ambientHum', SOUNDS.ambientHum, soundsRef.current.gains.ambientHum);
      if (audio) {
        audio.play().catch(err => {
          console.warn('[SoundEngine] Failed to play ambient hum:', err.message);
        });
      }
    });
  };

  const stopAmbientHum = () => {
    ambientHumPlayIntent.current = false;
    const audio = soundsRef.current.ambientHum;
    if (audio) {
      audio.pause();
      console.log('[SoundEngine] Stopped ambient hum.');
    }
  };

  const keyboardPlayIntent = useRef(false);

  const playKeyboardLoop = () => {
    keyboardPlayIntent.current = true;
    unlockAudioContext().then(() => {
      if (!keyboardPlayIntent.current) return;
      const audio = setupLoop('keyboardLoop', SOUNDS.keyboardLoop, soundsRef.current.gains.keyboardLoop);
      if (audio) {
        audio.play().catch(err => {
          console.warn('[SoundEngine] Failed to play keyboard loop:', err.message);
        });
      }
    });
  };

  const stopKeyboardLoop = () => {
    keyboardPlayIntent.current = false;
    const audio = soundsRef.current.keyboardLoop;
    if (audio) {
      audio.pause();
      console.log('[SoundEngine] Stopped keyboard loop.');
    }
  };

  const playClockTick = () => {
    unlockAudioContext().then(() => {
      const audio = setupLoop('clockTick', SOUNDS.clockTick, soundsRef.current.gains.clockTick);
      if (audio) {
        audio.play().catch(err => console.warn('[SoundEngine] Failed to play clock:', err.message));
      }
    });
  };

  const stopClockTick = () => {
    const audio = soundsRef.current.clockTick;
    if (audio) {
      audio.pause();
    }
  };

  const playMeetingMuffled = () => {
    unlockAudioContext().then(() => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      // Try loading the muffled voices mp3
      const audio = setupLoop('meetingMuffled', SOUNDS.meetingMuffled, soundsRef.current.gains.meetingMuffled);
      if (audio) {
        audio.play().then(() => {
          console.log('[SoundEngine] Playing meeting muffled audio from file.');
        }).catch(err => {
          console.warn('[SoundEngine] Failed to play meeting muffled file:', err.message);
        });
      }

      // Try loading the laughter mp3
      const laughter = setupLoop('meetingLaughter', SOUNDS.meetingLaughter, soundsRef.current.gains.meetingLaughter);
      if (laughter) {
        laughter.play().then(() => {
          console.log('[SoundEngine] Playing meeting laughter audio from file.');
        }).catch(err => {
          console.warn('[SoundEngine] Failed to play meeting laughter file:', err.message);
        });
      }
    });
  };

  const playFlicker = () => {
    unlockAudioContext().then(() => {
      const audio = setupLoop('flicker', SOUNDS.flicker, soundsRef.current.gains.flicker);
      if (audio) {
        audio.play().catch(err => console.warn('[SoundEngine] Failed to play flicker:', err.message));
      }
    });
  };

  const stopFlicker = () => {
    const audio = soundsRef.current.flicker;
    if (audio) {
      audio.pause();
    }
  };

  const playThirdWallSilence = () => {
    unlockAudioContext().then(() => {
      const audio = new Audio(SOUNDS.thirdWallSilence);
      audio.crossOrigin = 'anonymous';
      audio.loop = true; // loop it during the freeze
      if (audioCtxRef.current) {
        const source = audioCtxRef.current.createMediaElementSource(audio);
        source.connect(audioCtxRef.current.destination);
      }
      soundsRef.current.thirdWallSilence = audio;
      audio.play().catch(err => console.warn('[SoundEngine] Failed to play silence:', err.message));
    });
  };

  const stopThirdWallSilence = () => {
    const audio = soundsRef.current.thirdWallSilence;
    if (audio) {
      audio.pause();
    }
  };

  const playTerminal = () => {
    unlockAudioContext().then(() => {
      const audio = setupLoop('terminalTyping', SOUNDS.terminalTyping, soundsRef.current.gains.terminalTyping);
      if (audio) {
        audio.play().catch(err => console.warn('[SoundEngine] Failed to play terminal typing:', err.message));
      }
    });
  };

  const stopTerminal = () => {
    const audio = soundsRef.current.terminalTyping;
    if (audio) {
      audio.pause();
    }
  };

  const orchestrationIntent = useRef(false);
  const currentTrackIndex = useRef(0);
  const orchestrationTracks = [
    '/music/m1.mp3',
    '/music/m2.mp3',
    '/music/m3.mp3',
    '/music/m4.mp3',
    '/music/m5.mp3',
    '/music/m6.mp3',
    '/music/m7.mp3'
  ];

  const playNextOrchestrationTrack = () => {
    if (!orchestrationIntent.current) return;
    
    if (currentTrackIndex.current >= orchestrationTracks.length) {
      currentTrackIndex.current = 0; // loop back to start
    }
    
    if (soundsRef.current.orchestrationAudio) {
      soundsRef.current.orchestrationAudio.pause();
      soundsRef.current.orchestrationAudio.onended = null;
    }
    
    const src = orchestrationTracks[currentTrackIndex.current];
    const audio = new Audio(src);
    audio.crossOrigin = 'anonymous';
    
    audio.onended = () => {
      currentTrackIndex.current++;
      playNextOrchestrationTrack();
    };
    
    if (audioCtxRef.current) {
      const source = audioCtxRef.current.createMediaElementSource(audio);
      source.connect(soundsRef.current.gains.orchestration);
    }
    
    soundsRef.current.orchestrationAudio = audio;
    audio.play().catch(err => console.warn('[SoundEngine] Failed to play orchestration track:', err.message));
  };

  const playOrchestration = () => {
    orchestrationIntent.current = true;
    currentTrackIndex.current = 0;
    unlockAudioContext().then(() => {
      if (!orchestrationIntent.current) return;
      playNextOrchestrationTrack();
    });
  };

  const stopOrchestration = () => {
    orchestrationIntent.current = false;
    if (soundsRef.current.orchestrationAudio) {
      soundsRef.current.orchestrationAudio.pause();
      soundsRef.current.orchestrationAudio.onended = null;
    }
  };

  const playBookDrop = () => {
    unlockAudioContext().then(() => {
      const audio = new Audio(SOUNDS.book);
      audio.crossOrigin = 'anonymous';
      if (audioCtxRef.current) {
        const source = audioCtxRef.current.createMediaElementSource(audio);
        source.connect(audioCtxRef.current.destination);
      }
      audio.play().catch(err => console.warn('[SoundEngine] Failed to play book drop:', err.message));
    });
  };

  const playArchitectWalk = () => {
    unlockAudioContext().then(() => {
      // Loop the walking sound until stopped
      const audio = setupLoop('architectWalk', SOUNDS.architectWalk, soundsRef.current.gains.ambientHum);
      if (audio) {
        audio.play().catch(err => console.warn('[SoundEngine] Failed to play architect walk:', err.message));
      }
    });
  };

  const stopArchitectWalk = () => {
    const audio = soundsRef.current.architectWalk;
    if (audio) {
      audio.pause();
    }
  };

  const playHover = (agentId) => {
    // Optional placeholder for future hover sounds
  };

  const stopMeetingMuffled = () => {
    const audio = soundsRef.current.meetingMuffled;
    if (audio) audio.pause();
    
    const laughter = soundsRef.current.meetingLaughter;
    if (laughter) laughter.pause();
    
    console.log('[SoundEngine] Stopped meeting sound.');
  };

  const playMonitorFlicker = () => {
    unlockAudioContext().then(() => {
      const audio = setupLoop('monitorFlicker', SOUNDS.monitorFlicker, soundsRef.current.gains.monitorFlicker);
      if (audio) {
        audio.play().catch(err => console.warn('[SoundEngine] Failed to play monitor flicker:', err.message));
      }
    });
  };

  const stopMonitorFlicker = () => {
    const audio = soundsRef.current.monitorFlicker;
    if (audio) {
      audio.pause();
    }
  };

  const stopAllSounds = () => {
    stopAmbientHum();
    stopKeyboardLoop();
    stopMeetingMuffled();
    stopClockTick();
    stopFlicker();
    stopTerminal();
    stopThirdWallSilence();
    stopArchitectWalk();
    stopMonitorFlicker();
    stopOrchestration();
    if (soundsRef.current.clockInterval) {
      clearInterval(soundsRef.current.clockInterval);
      soundsRef.current.clockInterval = null;
    }
  };

  const startFoundationSounds = () => {
    console.log('[SoundEngine] Starting foundation sounds...');
    playAmbientHum();
    playClockTick();
  };

  const stopClockInterval = () => {
    stopClockTick();
  };

  // Memoize all exposed functions to prevent re-renders when used in dependency arrays
  const api = React.useMemo(() => ({
    playAmbientHum,
    stopAmbientHum,
    playKeyboardLoop,
    stopKeyboardLoop,
    playClockTick,
    stopClockTick,
    playMeetingMuffled,
    stopMeetingMuffled,
    playFlicker,
    stopFlicker,
    playThirdWallSilence,
    stopThirdWallSilence,
    playBookDrop,
    playArchitectWalk,
    stopArchitectWalk,
    playMonitorFlicker,
    stopMonitorFlicker,
    playHover,
    playTerminal,
    stopTerminal,
    playOrchestration,
    stopOrchestration,
    stopAllSounds,
    startFoundationSounds,
    stopClockInterval,
    unlock: unlockAudioContext
  }), []);

  // Expose to window for global access/interop
  useEffect(() => {
    window.__workroom_sound = api;

    // Global hook click/keydown listeners to unlock AudioContext early
    const handleGesture = () => {
      unlockAudioContext();
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);

    // Mute/Pause sound on tab change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(err => console.warn('[SoundEngine] Suspend failed:', err));
        }
      } else {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(err => console.warn('[SoundEngine] Resume failed:', err));
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (soundsRef.current.clockInterval) {
        clearInterval(soundsRef.current.clockInterval);
      }
    };
  }, []);

  return api;
}
