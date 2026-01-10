export function VoiceButton({ isListening, isDisabled, onPressStart, onPressEnd }) {
  return (
    <button
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      disabled={isDisabled}
      className={`
        relative w-32 h-32 rounded-full transition-all duration-200
        flex items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${
          isDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : isListening
            ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
        }
      `}
    >
      {/* Pulsing animation when listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
      )}

      {/* Microphone icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  );
}
