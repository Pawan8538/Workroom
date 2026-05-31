import { useEffect, useRef } from 'react';
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
      clockTick: null
    },
    // Store source nodes
    sources: {
      ambientHum: null,
      keyboardLoop: null,
      meetingMuffled: null
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
      soundsRef.current.gains.ambientHum.gain.setValueAtTime(0.3, ctx.currentTime);
      soundsRef.current.gains.ambientHum.connect(ctx.destination);

      soundsRef.current.gains.keyboardLoop = ctx.createGain();
      soundsRef.current.gains.keyboardLoop.gain.setValueAtTime(0.15, ctx.currentTime);
      soundsRef.current.gains.keyboardLoop.connect(ctx.destination);

      soundsRef.current.gains.meetingMuffled = ctx.createGain();
      soundsRef.current.gains.meetingMuffled.gain.setValueAtTime(0.15, ctx.currentTime);
      soundsRef.current.gains.meetingMuffled.connect(ctx.destination);

      soundsRef.current.gains.clockTick = ctx.createGain();
      soundsRef.current.gains.clockTick.gain.setValueAtTime(0.4, ctx.currentTime);
      soundsRef.current.gains.clockTick.connect(ctx.destination);

      console.log('[SoundEngine] AudioContext and GainNodes initialized.');
    } catch (e) {
      console.error('[SoundEngine] Failed to initialize AudioContext:', e);
    }
  };

  const unlockAudioContext = async () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
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

  const playAmbientHum = () => {
    unlockAudioContext().then(() => {
      const audio = setupLoop('ambientHum', SOUNDS.ambientHum, soundsRef.current.gains.ambientHum);
      if (audio) {
        audio.play().catch(err => {
          console.warn('[SoundEngine] Failed to play ambient hum:', err.message);
        });
      }
    });
  };

  const stopAmbientHum = () => {
    const audio = soundsRef.current.ambientHum;
    if (audio) {
      audio.pause();
      console.log('[SoundEngine] Stopped ambient hum.');
    }
  };

  const playKeyboardLoop = () => {
    unlockAudioContext().then(() => {
      const audio = setupLoop('keyboardLoop', SOUNDS.keyboardLoop, soundsRef.current.gains.keyboardLoop);
      if (audio) {
        audio.play().catch(err => {
          console.warn('[SoundEngine] Failed to play keyboard loop:', err.message);
        });
      }
    });
  };

  const stopKeyboardLoop = () => {
    const audio = soundsRef.current.keyboardLoop;
    if (audio) {
      audio.pause();
      console.log('[SoundEngine] Stopped keyboard loop.');
    }
  };

  const playClockTick = () => {
    unlockAudioContext().then(() => {
      if (!audioCtxRef.current) return;
      try {
        const audio = new Audio(SOUNDS.clockTick);
        audio.crossOrigin = 'anonymous';
        const source = audioCtxRef.current.createMediaElementSource(audio);
        source.connect(soundsRef.current.gains.clockTick);
        audio.play().catch(err => {
          console.warn('[SoundEngine] Failed to play clock tick:', err.message);
        });
      } catch (e) {
        // Fallback: direct play if routing fails or already connected
        const audio = new Audio(SOUNDS.clockTick);
        audio.volume = 0.4;
        audio.play().catch(err => {
          console.warn('[SoundEngine] Failed to play clock tick directly:', err.message);
        });
      }
    });
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
          console.warn('[SoundEngine] Failed to play meeting muffled file, starting synth oscillator fallback:', err.message);
          startSynthMeetingMuffled();
        });
      } else {
        startSynthMeetingMuffled();
      }
    });
  };

  const startSynthMeetingMuffled = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (soundsRef.current.oscillator) {
      // Already running
      return;
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      // Connect to the meetingMuffled gain node
      gain.gain.setValueAtTime(0.05, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      soundsRef.current.oscillator = osc;
      soundsRef.current.oscillatorGain = gain;
      console.log('[SoundEngine] Synth meeting muffled oscillator started.');
    } catch (e) {
      console.error('[SoundEngine] Failed to start synth meeting muffled:', e);
    }
  };

  const stopMeetingMuffled = () => {
    const audio = soundsRef.current.meetingMuffled;
    if (audio) {
      audio.pause();
    }
    
    if (soundsRef.current.oscillator) {
      try {
        soundsRef.current.oscillator.stop();
        soundsRef.current.oscillator.disconnect();
      } catch (e) {}
      soundsRef.current.oscillator = null;
    }
    if (soundsRef.current.oscillatorGain) {
      try {
        soundsRef.current.oscillatorGain.disconnect();
      } catch (e) {}
      soundsRef.current.oscillatorGain = null;
    }
    console.log('[SoundEngine] Stopped meeting muffled.');
  };

  const stopAllSounds = () => {
    stopAmbientHum();
    stopKeyboardLoop();
    stopMeetingMuffled();
    if (soundsRef.current.clockInterval) {
      clearInterval(soundsRef.current.clockInterval);
      soundsRef.current.clockInterval = null;
      console.log('[SoundEngine] Clock tick interval cleared.');
    }
  };

  const startFoundationSounds = () => {
    console.log('[SoundEngine] Starting foundation sounds...');
    playAmbientHum();
    playKeyboardLoop();

    // Start clock interval if not already running
    if (!soundsRef.current.clockInterval) {
      soundsRef.current.clockInterval = setInterval(() => {
        console.log('[SoundEngine] 60s Clock Tick Interval Fired');
        playClockTick();
      }, 60000);
      console.log('[SoundEngine] 60s Clock Tick Interval set up.');
    }
  };

  const stopClockInterval = () => {
    if (soundsRef.current.clockInterval) {
      clearInterval(soundsRef.current.clockInterval);
      soundsRef.current.clockInterval = null;
      console.log('[SoundEngine] Clock tick interval stopped.');
    }
  };

  // Expose to window for global access/interop
  useEffect(() => {
    window.__workroom_sound = {
      playAmbientHum,
      stopAmbientHum,
      playKeyboardLoop,
      stopKeyboardLoop,
      playClockTick,
      playMeetingMuffled,
      stopMeetingMuffled,
      stopAllSounds,
      startFoundationSounds,
      stopClockInterval,
      unlock: unlockAudioContext
    };

    // Global hook click/keydown listeners to unlock AudioContext early
    const handleGesture = () => {
      unlockAudioContext();
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      if (soundsRef.current.clockInterval) {
        clearInterval(soundsRef.current.clockInterval);
      }
    };
  }, []);

  return {
    playAmbientHum,
    stopAmbientHum,
    playKeyboardLoop,
    stopKeyboardLoop,
    playClockTick,
    playMeetingMuffled,
    stopMeetingMuffled,
    stopAllSounds,
    startFoundationSounds,
    stopClockInterval,
    unlock: unlockAudioContext
  };
}
