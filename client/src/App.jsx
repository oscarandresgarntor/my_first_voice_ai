import { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useWebSocket } from './hooks/useWebSocket';
import { VoiceButton } from './components/VoiceButton';
import { Transcript } from './components/Transcript';
import { StatusIndicator } from './components/StatusIndicator';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const {
    isListening,
    transcript,
    isSupported: speechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    isSupported: speechSynthesisSupported,
    speakImmediate,
    cancel: cancelSpeech,
  } = useSpeechSynthesis();

  const { isConnected, sendMessage, onMessage } = useWebSocket(WS_URL);

  // Handle incoming WebSocket messages
  useEffect(() => {
    onMessage((data) => {
      switch (data.type) {
        case 'connected':
          console.log('Connected to server:', data.message);
          break;

        case 'status':
          if (data.status === 'thinking') {
            setIsThinking(true);
          }
          break;

        case 'assistant_chunk':
          setIsThinking(false);
          setCurrentResponse((prev) => prev + data.text);
          break;

        case 'assistant_done':
          setIsThinking(false);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.fullText },
          ]);
          setCurrentResponse('');
          // Speak the response
          speakImmediate(data.fullText);
          break;

        case 'error':
          console.error('Server error:', data.message);
          setIsThinking(false);
          setCurrentResponse('');
          break;

        default:
          break;
      }
    });
  }, [onMessage, speakImmediate]);

  // Handle push-to-talk start
  const handlePressStart = useCallback(() => {
    // Cancel any ongoing speech when user starts talking
    cancelSpeech();
    startListening();
  }, [cancelSpeech, startListening]);

  // Handle push-to-talk end
  const handlePressEnd = useCallback(() => {
    stopListening();

    // Small delay to capture final transcript
    setTimeout(() => {
      const finalTranscript = transcript.trim();
      if (finalTranscript) {
        // Add user message to display
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: finalTranscript },
        ]);

        // Send to server
        sendMessage({
          type: 'user_message',
          text: finalTranscript,
        });

        resetTranscript();
      }
    }, 100);
  }, [stopListening, transcript, sendMessage, resetTranscript]);

  // Handle clear conversation
  const handleClear = useCallback(() => {
    setMessages([]);
    setCurrentResponse('');
    sendMessage({ type: 'clear_history' });
    cancelSpeech();
  }, [sendMessage, cancelSpeech]);

  // Check browser compatibility
  if (!speechRecognitionSupported) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Browser Not Supported
          </h1>
          <p className="text-gray-600">
            Speech recognition is not supported in your browser. Please use
            Chrome or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              History Expert
            </h1>
            <p className="text-sm text-gray-500">
              Your AI guide to world history
            </p>
          </div>
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
          >
            Clear Chat
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
        {/* Transcript area */}
        <Transcript messages={messages} currentResponse={currentResponse} />

        {/* Controls */}
        <div className="mt-4 flex flex-col items-center space-y-4 pb-4">
          {/* Status */}
          <StatusIndicator
            isConnected={isConnected}
            isListening={isListening}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            currentTranscript={transcript}
          />

          {/* Push-to-talk button */}
          <div className="text-center">
            <VoiceButton
              isListening={isListening}
              isDisabled={!isConnected || isThinking}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
            />
            <p className="mt-3 text-sm text-gray-500">
              {isListening ? 'Release to send' : 'Hold to speak'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-3 px-6 text-center text-xs text-gray-400">
        {!speechSynthesisSupported && (
          <p className="text-yellow-600 mb-1">
            Text-to-speech not available in your browser
          </p>
        )}
        Powered by Groq + Llama 3.3
      </footer>
    </div>
  );
}

export default App;
