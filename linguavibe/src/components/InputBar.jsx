import React from 'react';
import LanguageSelector from './LanguageSelector';
import VoiceInput from './VoiceInput';

const InputBar = ({
  inputText,
  setInputText,
  selectedLang,
  onLanguageChange,
  onSendMessage,
  isRecording,
  onToggleRecording,
  onEmojiClick,
  disabled = false
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="input-bar">
      <div className="input-container-wrapper">
        <LanguageSelector
          selectedLang={selectedLang}
          onLanguageChange={onLanguageChange}
          position="input"
          disabled={disabled}
        />

        <input
          type="text"
          className="message-input-field"
          placeholder={disabled ? "Connecting..." : "Speak or Type a message..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />

        <button 
          className="emoji-btn" 
          onClick={onEmojiClick} 
          title="Add Emoji"
          disabled={disabled}
        >
          😊
        </button>

        <VoiceInput
          isRecording={isRecording}
          onToggleRecording={onToggleRecording}
          disabled={disabled}
        />

        <button 
          className="send-message-btn" 
          onClick={onSendMessage}
          title="Send Message"
          disabled={disabled || !inputText.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
    </div>
  );
};

export default InputBar;