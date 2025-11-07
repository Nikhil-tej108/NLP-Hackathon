import React from 'react';

const EmojiPicker = ({ show, onEmojiSelect, onClose }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓',
    '👍', '👎', '👌', '✌️', '🤞', '🤟',
    '🤘', '🤙', '👈', '👉', '👆', '👇',
    '☝️', '✋', '🤚', '🖐', '🖖', '👋',
    '🤝', '🙏', '💪', '🦾', '🦵', '🦿'
  ];

  if (!show) return null;

  return (
    <>
      <div className="emoji-picker-overlay" onClick={onClose}></div>
      <div className="emoji-picker-panel">
        <div className="emoji-picker-header">
          <span>Select Emoji</span>
          <button className="emoji-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="emoji-grid">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              className="emoji-item"
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default EmojiPicker;