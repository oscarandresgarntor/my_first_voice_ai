import { useState, useRef, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef(null);
  const textQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

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

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
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
  }, []);

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

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && v.name.includes('Google')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
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
    [isSupported]
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
  };
}
