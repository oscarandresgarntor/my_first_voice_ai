export function VoiceSelector({ voiceProfiles, selectedVoiceId, onVoiceChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="voice-select" className="text-sm text-gray-500">
        Voice:
      </label>
      <select
        id="voice-select"
        value={selectedVoiceId}
        onChange={(e) => onVoiceChange(e.target.value)}
        className="text-sm bg-white border border-gray-300 rounded px-2 py-1
                   focus:outline-none focus:ring-2 focus:ring-blue-300
                   cursor-pointer hover:border-gray-400"
      >
        {voiceProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
    </div>
  );
}
