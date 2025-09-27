"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useMiniverseStore } from '../data/store';

const MusicPlayer: React.FC = () => {
  const { isMusicEnabled, musicVolume, setMusicVolume, toggleMusic } = useMiniverseStore();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillators, setOscillators] = useState<OscillatorNode[]>([]);
  const [gainNodes, setGainNodes] = useState<GainNode[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        setAudioContext(ctx);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Create soft classical music with multiple melodies
  const createAmbientMusic = () => {
    if (!audioContext || !isMusicEnabled) return;

    try {
      const newOscillators: OscillatorNode[] = [];
      const newGainNodes: GainNode[] = [];

      // Classical chord progression (I-V-vi-IV in C major)
      const chordProgressions = [
        [130.81, 164.81, 196.00], // C major (C3, E3, G3)
        [98.00, 123.47, 146.83],  // G major (G2, B2, D3)
        [110.00, 130.81, 164.81], // A minor (A2, C3, E3)
        [174.61, 207.65, 246.94]  // F major (F3, A3, C4)
      ];

      // Main melody - inspired by classical pieces
      const mainMelody = [
        261.63, 293.66, 329.63, 349.23, // C4, D4, E4, F4
        392.00, 349.23, 329.63, 293.66, // G4, F4, E4, D4
        261.63, 220.00, 196.00, 220.00, // C4, A3, G3, A3
        261.63, 293.66, 329.63, 261.63  // C4, D4, E4, C4
      ];

      // Secondary melody - counterpoint
      const secondaryMelody = [
        196.00, 220.00, 246.94, 261.63, // G3, A3, B3, C4
        293.66, 261.63, 246.94, 220.00, // D4, C4, B3, A3
        196.00, 174.61, 164.81, 174.61, // G3, F3, E3, F3
        196.00, 220.00, 246.94, 196.00  // G3, A3, B3, G3
      ];

      // Create chord accompaniment
      chordProgressions.forEach((chord, chordIndex) => {
        chord.forEach((freq, noteIndex) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'triangle'; // Warmer than sine for classical feel
          
          // Gentle fade in with staggered timing
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            musicVolume * 0.015 * (1 - noteIndex * 0.15), 
            audioContext.currentTime + 2 + chordIndex * 0.8
          );
          
          // Add subtle vibrato for warmth
          const vibrato = audioContext.createOscillator();
          const vibratoGain = audioContext.createGain();
          const vibratoDepth = audioContext.createGain();
          
          vibrato.connect(vibratoGain);
          vibratoGain.connect(vibratoDepth);
          vibratoDepth.connect(oscillator.frequency);
          
          vibrato.frequency.setValueAtTime(5.2, audioContext.currentTime);
          vibratoGain.gain.setValueAtTime(1.5, audioContext.currentTime);
          vibratoDepth.gain.setValueAtTime(0.8, audioContext.currentTime);
          
          vibrato.start();
          oscillator.start();
          
          newOscillators.push(oscillator, vibrato);
          newGainNodes.push(gainNode, vibratoGain, vibratoDepth);
        });
      });

      // Create main melody line
      mainMelody.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine'; // Pure tone for melody
        
        // Melody timing - each note plays for 0.8 seconds
        const startTime = audioContext.currentTime + 3 + index * 0.8;
        const endTime = startTime + 0.8;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(
          musicVolume * 0.025, 
          startTime + 0.1
        );
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
        
        newOscillators.push(oscillator);
        newGainNodes.push(gainNode);
      });

      // Create secondary melody (delayed start)
      secondaryMelody.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'triangle'; // Slightly different timbre
        
        // Secondary melody starts after main melody
        const startTime = audioContext.currentTime + 6 + index * 0.8;
        const endTime = startTime + 0.8;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(
          musicVolume * 0.018, 
          startTime + 0.1
        );
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
        
        newOscillators.push(oscillator);
        newGainNodes.push(gainNode);
      });

      // Add soft bass line for foundation
      const bassFreqs = [65.41, 73.42, 55.00, 61.74]; // C2, D2, A1, B1
      bassFreqs.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          musicVolume * 0.012, 
          audioContext.currentTime + 1.5 + index * 0.5
        );
        
        oscillator.start();
        newOscillators.push(oscillator);
        newGainNodes.push(gainNode);
      });

      setOscillators(newOscillators);
      setGainNodes(newGainNodes);
    } catch (error) {
      console.error('Failed to create classical music:', error);
    }
  };

  // Stop ambient music
  const stopAmbientMusic = () => {
    oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
    });
    setOscillators([]);
    setGainNodes([]);
  };

  // Handle music state changes
  useEffect(() => {
    if (!isInitialized) return;

    if (isMusicEnabled) {
      createAmbientMusic();
    } else {
      stopAmbientMusic();
    }

    return () => {
      stopAmbientMusic();
    };
  }, [isMusicEnabled, isInitialized]);

  // Handle volume changes
  useEffect(() => {
    if (!audioContext || gainNodes.length === 0) return;

    gainNodes.forEach((gainNode, index) => {
      if (gainNode && gainNode.gain) {
        try {
          gainNode.gain.cancelScheduledValues(audioContext.currentTime);
          // Apply volume with gentle scaling for different layers
          const baseVolume = musicVolume * 0.02;
          const scaledVolume = baseVolume * (1 - (index % 10) * 0.05);
          gainNode.gain.setValueAtTime(
            Math.max(0, scaledVolume),
            audioContext.currentTime
          );
        } catch (error) {
          // Handle case where gain node might be disconnected
          console.warn('Volume adjustment failed for node:', error);
        }
      }
    });
  }, [musicVolume, gainNodes, audioContext]);

  return (
    <>
      {/* Music Controls UI */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-300 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={toggleMusic}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title={isMusicEnabled ? "Pause Classical Music" : "Play Classical Music"}
            >
              {!isInitialized ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isMusicEnabled ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {musicVolume === 0 ? "🔇" : musicVolume < 0.3 ? "🔉" : "🔊"}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                title="Volume Control"
              />
            </div>

            {/* Status Indicator */}
            <div className="text-xs text-gray-500">
              {!isInitialized ? "Initializing..." : isMusicEnabled ? "Classical Music On" : "Music Off"}
            </div>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;
