import React from 'react';

const VoiceInput = ({ isRecording, onToggleRecording }) => {
  return (
    <button
      className={`voice-input-btn ${isRecording ? 'recording-active' : ''}`}
      onClick={onToggleRecording}
      title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z"
          fill="currentColor"
        />
        <path
          d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export default VoiceInput;