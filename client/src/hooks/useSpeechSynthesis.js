import { useState, useRef, useCallback, useEffect } from 'react';

// Define 4 voice profiles users can choose from
const VOICE_PROFILES = [
  { id: 'default', name: 'Default', filter: (v) => v.lang.startsWith('en') },
  { id: 'female', name: 'Female', filter: (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')) },
  { id: 'male', name: 'Male', filter: (v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Tom')) },
  { id: 'british', name: 'British', filter: (v) => v.lang === 'en-GB' },
];

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('default');
  const utteranceRef = useRef(null);
  const textQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  // Load available voices
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Get voice based on selected profile
  const getSelectedVoice = useCallback(() => {
    if (availableVoices.length === 0) return null;

    const profile = VOICE_PROFILES.find((p) => p.id === selectedVoiceId) || VOICE_PROFILES[0];

    // Try to find a voice matching the profile filter
    let voice = availableVoices.find(profile.filter);

    // Fallback to any English voice
    if (!voice) {
      voice = availableVoices.find((v) => v.lang.startsWith('en'));
    }

    // Fallback to first available voice
    if (!voice && availableVoices.length > 0) {
      voice = availableVoices[0];
    }

    return voice;
  }, [availableVoices, selectedVoiceId]);

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || textQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsSpeaking(true);

    const text = textQueueRef.current.join(' ');
    textQueueRef.current = [];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getSelectedVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      isProcessingRef.current = false;
      if (textQueueRef.current.length > 0) {
        processQueue();
      } else {
        setIsSpeaking(false);
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        console.error('Speech synthesis error:', event.error);
      }
      isProcessingRef.current = false;
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [getSelectedVoice]);

  const speak = useCallback(
    (text) => {
      if (!text || !isSupported) return;

      textQueueRef.current.push(text);

      // Debounce processing to accumulate chunks
      setTimeout(() => {
        processQueue();
      }, 100);
    },
    [isSupported, processQueue]
  );

  const speakImmediate = useCallback(
    (text) => {
      if (!text || !isSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      textQueueRef.current = [];
      isProcessingRef.current = false;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voice = getSelectedVoice();
      if (voice) {
        utterance.voice = voice;
      }

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, getSelectedVoice]
  );

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    textQueueRef.current = [];
    isProcessingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    speakImmediate,
    cancel,
    // Voice selection
    voiceProfiles: VOICE_PROFILES,
    selectedVoiceId,
    setSelectedVoiceId,
  };
}
