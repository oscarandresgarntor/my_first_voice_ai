import { useEffect, useRef } from 'react';

export function Transcript({ messages, currentResponse }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg"
    >
      {messages.length === 0 && !currentResponse && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-medium">Welcome to History Expert</p>
          <p className="text-sm mt-2">
            Hold the microphone button and ask me anything about world history!
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      ))}

      {/* Show streaming response */}
      {currentResponse && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-white text-gray-800 shadow-sm border border-gray-200">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {currentResponse}
              <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
