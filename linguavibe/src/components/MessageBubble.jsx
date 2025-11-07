import React from 'react';

const MessageBubble = ({ message, emojiMode }) => {
  const isUserA = message.sender === 'A';
  
  const getRandomEmoji = () => {
    const emojis = ['😊', '😃', '✨', '💫'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  // Avatar component
  const Avatar = ({ user }) => (
    <div className={`avatar ${user === 'A' ? 'avatar-a' : 'avatar-b'}`}>
      {user}
    </div>
  );

  return (
    <div className={`message-wrapper ${isUserA ? 'message-left' : 'message-right'}`}>
      {isUserA && <Avatar user="A" />}
      
      <div className={`message-bubble ${isUserA ? 'bubble-a' : 'bubble-b'}`}>
        {message.isVoice ? (
          <div className="voice-message">
            <button className="voice-play-btn">
              {message.isPlaying ? '⏸' : '▶'}
            </button>
            <div className="waveform">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="voice-label">User {message.sender}: Voice message...</span>
          </div>
        ) : (
          <>
            <div className="message-primary">
              {message.text}
              {emojiMode && <span className="bubble-emoji">{getRandomEmoji()}</span>}
            </div>
            <div className="message-secondary">
              {message.translation}
              {emojiMode && <span className="bubble-emoji">{getRandomEmoji()}</span>}
            </div>
          </>
        )}
        {message.hasAudio && !message.isVoice && (
          <button className="audio-icon">🔊</button>
        )}
      </div>
      
      {!isUserA && <Avatar user="B" />}
    </div>
  );
};

export default MessageBubble;