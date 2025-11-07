import React from 'react';
import MessageBubble from './MessageBubble';


const ChatWindow = ({ messages, emojiMode, isTranslating }) => {
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h1 className="app-logo">
          <img src=''></img>
        </h1>
        <p className="app-subtitle">Real-time Translation Chat</p>
        
        <div className="user-avatars">
          <div className="avatar avatar-a-large">A</div>
          <div className="avatar avatar-b-large">B</div>
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg}
            emojiMode={emojiMode}
          />
        ))}
        
        {isTranslating && (
          <div className="translating-indicator">
            <div className="translating-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="translating-text">Translating...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;