export function StopButton({ isSpeaking, onStop }) {
  return (
    <button
      onClick={onStop}
      disabled={!isSpeaking}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${
          isSpeaking
            ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }
      `}
      title={isSpeaking ? 'Stop speaking' : 'Not speaking'}
    >
      {/* Stop icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <rect x="6" y="6" width="12" height="12" rx="1" />
      </svg>
      <span className="text-sm font-medium">Stop</span>
    </button>
  );
}
