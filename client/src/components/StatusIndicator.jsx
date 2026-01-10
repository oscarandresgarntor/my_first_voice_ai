export function StatusIndicator({
  isConnected,
  isListening,
  isThinking,
  isSpeaking,
  currentTranscript,
}) {
  const getStatusText = () => {
    if (!isConnected) return 'Connecting...';
    if (isListening) return 'Listening...';
    if (isThinking) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-yellow-500';
    if (isListening) return 'bg-red-500';
    if (isThinking) return 'bg-purple-500';
    if (isSpeaking) return 'bg-green-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <span className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-sm font-medium text-gray-600">{getStatusText()}</span>
      </div>

      {/* Show live transcript while listening */}
      {isListening && currentTranscript && (
        <div className="max-w-md text-center">
          <p className="text-sm text-gray-500 italic">"{currentTranscript}"</p>
        </div>
      )}
    </div>
  );
}
